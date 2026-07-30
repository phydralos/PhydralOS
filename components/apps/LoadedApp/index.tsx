import { basename, join } from "path";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useWindowSize from "components/system/Window/useWindowSize";
import { useAuthContext } from "contexts/auth";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import {
  ACCOUNT_BRIDGE_RESPONSE,
  injectAccountBridge,
  isAccountBridgeRequest,
} from "lib/accountBridge";
import { getInstalledApps, type AppManifest } from "utils/appInstaller";
import { bufferToUrl, getExtension } from "utils/functions";

type LoadedAppManifest = Partial<AppManifest> & {
  title?: string;
};

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css",
  ".gif": "image/gif",
  ".htm": "text/html",
  ".html": "text/html",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const LoadedApp: FC<ComponentProcessProps> = ({ id }) => {
  const {
    argument,
    processes: { [id]: { url = "" } = {} } = {},
    title,
  } = useProcesses();
  const { updateBalance, user } = useAuthContext();
  const { exists, readFile, readdir, lstat, mkdirRecursive, writeFile } =
    useFileSystem();
  const { updateWindowSize } = useWindowSize(id);
  const [blobUrl, setBlobUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const createdUrlsRef = useRef<string[]>([]);

  const fsBridgeFunctions = useMemo(
    () => ({
      exists,
      lstat,
      mkdirRecursive,
      readFile,
      readdir,
      rmdir: (): Promise<boolean> => Promise.resolve(true),
      unlink: (): Promise<boolean> => Promise.resolve(true),
      updateFolder: (): void => undefined,
      writeFile,
    }),
    [exists, lstat, mkdirRecursive, readFile, readdir, writeFile]
  );

  useEffect(() => {
    const revokeCreatedUrls = (): void => {
      createdUrlsRef.current.forEach((createdUrl) => {
        try {
          URL.revokeObjectURL(createdUrl);
        } catch {
          // Ignore revoke errors
        }
      });
      createdUrlsRef.current = [];
    };

    if (!url) return revokeCreatedUrls;

    revokeCreatedUrls();

    const trackUrl = (createdUrl: string): string => {
      createdUrlsRef.current.push(createdUrl);
      return createdUrl;
    };

    const loadApp = async (): Promise<void> => {
      if (!(await exists(url))) return;

      const manifestPath = join(url, "manifest.json");

      if (!(await exists(manifestPath))) {
        const fileData = await readFile(url);
        const ext = getExtension(url);
        const mimeType = MIME_TYPES[ext] || "application/octet-stream";
        setBlobUrl(trackUrl(bufferToUrl(fileData, mimeType)));
        return;
      }

      const manifest = JSON.parse(
        (await readFile(manifestPath))?.toString() || "{}"
      ) as LoadedAppManifest;
      const entryFile = manifest.entry || "index.html";
      const entryPath = join(url, entryFile);

      // Apply manifest window flags (resizable + title bar controls)
      if (manifest.allowResizing === false) {
        argument(id, "allowResizing", false);
      }
      if (manifest.hideTitlebar) {
        argument(id, "hideTitlebar", true);
      }
      if (manifest.hideMinimizeButton) {
        argument(id, "hideMinimizeButton", true);
      }
      if (manifest.hideMaximizeButton) {
        argument(id, "hideMaximizeButton", true);
      }
      if (manifest.hideCloseButton) {
        argument(id, "hideCloseButton", true);
      }
      if (
        typeof manifest.width === "number" &&
        typeof manifest.height === "number"
      ) {
        updateWindowSize(manifest.height, manifest.width);
      }

      if (await exists(entryPath)) {
        let html = (await readFile(entryPath))?.toString() || "";

        const blobUrls: Record<string, string> = {};

        const resolvePath = (ref: string): string => {
          if (
            ref.startsWith("http://") ||
            ref.startsWith("https://") ||
            ref.startsWith("data:") ||
            ref.startsWith("blob:")
          ) {
            return ref;
          }

          const cleanRef = ref.replace(/^\.?\//, "");
          return join(url, cleanRef);
        };

        html = html.replace(
          /<(?:script|link|img|source)[^>]*(?:src|href)=["']([^"']+)["']/gi,
          (match: string, ref: string) => {
            if (
              ref.startsWith("http") ||
              ref.startsWith("data:") ||
              ref.startsWith("blob:")
            ) {
              return match;
            }

            const resolvedPath = resolvePath(ref);

            if (blobUrls[resolvedPath]) {
              return match.replace(ref, blobUrls[resolvedPath]);
            }

            return match;
          }
        );

        const inlineResources = async (): Promise<void> => {
          const processFile = async (filePath: string): Promise<string> => {
            if (blobUrls[filePath]) return blobUrls[filePath];
            if (!(await exists(filePath))) return "";

            const data = await readFile(filePath);
            const ext = getExtension(filePath);
            const mimeType = MIME_TYPES[ext] || "application/octet-stream";
            const bUrl = trackUrl(bufferToUrl(data, mimeType));
            blobUrls[filePath] = bUrl;
            return bUrl;
          };

          const tagRegex =
            /<(?:script|link|img|source)[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi;
          const refsToProcess: { ref: string; resolvedPath: string }[] = [];

          for (const tagMatch of html.matchAll(tagRegex)) {
            const [, ref] = tagMatch;

            if (
              !ref.startsWith("http") &&
              !ref.startsWith("data:") &&
              !ref.startsWith("blob:")
            ) {
              refsToProcess.push({ ref, resolvedPath: resolvePath(ref) });
            }
          }

          const replacements = await Promise.all(
            refsToProcess.map(async ({ ref, resolvedPath }) => ({
              bUrl: await processFile(resolvedPath),
              ref,
            }))
          );

          replacements.forEach(({ bUrl, ref }) => {
            if (bUrl) {
              html = html.replace(ref, bUrl);
            }
          });

          html = html.replace(
            /url\(["']?([^"')]+)["']?\)/gi,
            (match: string, ref: string) => {
              if (
                ref.startsWith("http") ||
                ref.startsWith("data:") ||
                ref.startsWith("blob:")
              ) {
                return match;
              }

              const resolvedPath = resolvePath(ref);
              if (blobUrls[resolvedPath]) {
                return `url(${blobUrls[resolvedPath]})`;
              }

              return match;
            }
          );

          const blob = new Blob([injectAccountBridge(html)], {
            type: "text/html",
          });
          const finalUrl = trackUrl(URL.createObjectURL(blob));
          setBlobUrl(finalUrl);
        };

        await inlineResources();

        if (manifest.title) {
          title(id, manifest.title);
        }
      }
    };

    loadApp();

    return () => {
      revokeCreatedUrls();
    };
  }, [argument, exists, id, readFile, title, updateWindowSize, url]);

  // Account bridge: respond to iframe account requests.
  // Read is always allowed; write only for App Store installed apps.
  useEffect(() => {
    const handleMessage = async (
      event: MessageEvent<unknown>
    ): Promise<void> => {
      const frameWindow = iframeRef.current?.contentWindow;

      if (!frameWindow || event.source !== frameWindow) return;

      const { data } = event;

      if (!isAccountBridgeRequest(data)) return;

      const appId = basename(url);
      const installedApps = await getInstalledApps(fsBridgeFunctions);
      const isAppStoreApp = installedApps[appId]?.source === "appstore";

      if (data.action === "getProfile") {
        frameWindow.postMessage(
          {
            __pyhdra: ACCOUNT_BRIDGE_RESPONSE,
            allowed: true,
            profile: user?.account
              ? {
                  balance: user.account.balance,
                  country: user.account.country,
                  isDeveloper: user.account.isDeveloper,
                  username: user.account.username,
                }
              : undefined,
            requestId: data.requestId,
          },
          { targetOrigin: "*" }
        );
      } else if (data.action === "updateBalance") {
        const allowed =
          isAppStoreApp &&
          typeof data.balance === "number" &&
          (await updateBalance(data.balance));

        frameWindow.postMessage(
          {
            __pyhdra: ACCOUNT_BRIDGE_RESPONSE,
            allowed,
            requestId: data.requestId,
          },
          { targetOrigin: "*" }
        );
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [fsBridgeFunctions, updateBalance, url, user]);

  if (!blobUrl) {
    return (
      <div
        style={{
          alignItems: "center",
          background: "#1a1a2e",
          color: "#8a8a9a",
          display: "flex",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        Loading app...
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      src={blobUrl}
      style={{
        backgroundColor: "#fff",
        border: "none",
        height: "100%",
        width: "100%",
      }}
      title="Loaded App"
    />
  );
};

export default memo(LoadedApp);

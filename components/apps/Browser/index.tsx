import { basename, join, resolve } from "path";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, X, Globe } from "lucide-react";
import { ADDRESS_INPUT_PROPS } from "components/apps/FileExplorer/AddressBar";
import useHistoryMenu from "components/apps/Browser/useHistoryMenu";
import {
  createDirectoryIndex,
  type DirectoryEntries,
} from "components/apps/Browser/directoryIndex";
import {
  DINO_GAME,
  HOME_PAGE,
  NOT_FOUND,
  SURF_TO_MISC,
} from "components/apps/Browser/config";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import useHistory from "hooks/useHistory";
import {
  FAVICON_BASE_PATH,
  IFRAME_CONFIG,
  ONE_TIME_PASSIVE_EVENT,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import {
  GOOGLE_SEARCH_QUERY,
  LOCAL_HOST,
  getExtension,
  getUrlOrSearch,
  haltEvent,
} from "utils/functions";
import {
  getInfoWithExtension,
  getModifiedTime,
  getShortcutInfo,
} from "components/system/Files/FileEntry/functions";
import { useSession } from "contexts/session";
import { cn } from "utils/cn";
import {
  rewriteUrlsForProxy,
  injectNavScript,
} from "components/apps/Browser/proxyUtils";

const Browser: FC<ComponentProcessProps> = ({ id }) => {
  const {
    icon: setIcon,
    linkElement,
    url: changeUrl,
    processes: { [id]: process },
    open,
  } = useProcesses();
  const { setForegroundId, updateRecentFiles } = useSession();
  const { prependFileToTitle } = useTitle(id);
  const { initialTitle = "", url = "" } = process || {};
  const initialUrl = url || HOME_PAGE;
  const { canGoBack, canGoForward, history, moveHistory, position } =
    useHistory(initialUrl, id);
  const { exists, fs, stat, readFile, readdir } = useFileSystem();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [srcDoc, setSrcDoc] = useState("");
  const [iframeSrc, setIframeSrc] = useState("");
  const changeHistory = (step: number): void => {
    moveHistory(step);

    if (inputRef.current) inputRef.current.value = history[position + step];
  };
  const currentUrl = useRef("");
  const navigateIframe = useCallback((newUrl: string): void => {
    setSrcDoc("");
    setIframeSrc(newUrl);
  }, []);
  const goToLink = useCallback(
    (newUrl: string): void => {
      if (inputRef.current) {
        inputRef.current.value = newUrl;
      }

      changeUrl(id, newUrl);
    },
    [changeUrl, id]
  );
  const { backMenu, forwardMenu } = useHistoryMenu(
    history,
    position,
    moveHistory
  );
  const setUrl = useCallback(
    async (addressInput: string): Promise<void> => {
      const { contentWindow } = iframeRef.current || {};

      if (contentWindow?.location) {
        const isHtml =
          [".htm", ".html"].includes(getExtension(addressInput)) &&
          (await exists(addressInput));

        setLoading(true);
        if (isHtml) setSrcDoc((await readFile(addressInput)).toString());
        setIcon(id, processDirectory.Browser.icon);

        const loadLocalSite = (localPath: string, localTitle: string): void => {
          navigateIframe(`${window.location.origin}${localPath}`);
          prependFileToTitle(localTitle);
        };
        const lowerAddressInput = addressInput.toLowerCase();

        if (lowerAddressInput.startsWith(SURF_TO_MISC.url)) {
          loadLocalSite(SURF_TO_MISC.path, SURF_TO_MISC.name);
        } else if (lowerAddressInput.startsWith(DINO_GAME.url)) {
          loadLocalSite(DINO_GAME.path, `${DINO_GAME.url}/`);
        } else if (!isHtml) {
          const processedUrl = await getUrlOrSearch(addressInput);

          if (
            LOCAL_HOST.has(processedUrl.host) ||
            LOCAL_HOST.has(addressInput)
          ) {
            const directory =
              decodeURI(processedUrl.pathname).replace(/\/$/, "") || "/";
            const searchParams = Object.fromEntries(
              new URLSearchParams(
                processedUrl.search.replace(";", "&")
              ).entries()
            );
            const { O: order, C: column } = searchParams;
            const isAscending = !order || order === "A";

            let newSrcDoc = NOT_FOUND;
            let newTitle = "404 Not Found";

            if (
              (await exists(directory)) &&
              (await stat(directory)).isDirectory()
            ) {
              const dirStats = (
                await Promise.all<DirectoryEntries>(
                  (await readdir(directory)).map(async (entry) => {
                    const href = join(directory, entry);
                    let description;
                    let shortcutUrl;

                    if (getExtension(entry) === SHORTCUT_EXTENSION) {
                      try {
                        ({ comment: description, url: shortcutUrl } =
                          getShortcutInfo(await readFile(href)));
                      } catch {
                        // Ignore failure to read shortcut
                      }
                    }

                    const filePath =
                      shortcutUrl && (await exists(shortcutUrl))
                        ? shortcutUrl
                        : href;
                    const stats = await stat(filePath);
                    const isDir = stats.isDirectory();

                    return {
                      description,
                      href: isDir && shortcutUrl ? shortcutUrl : href,
                      icon: isDir ? "folder" : undefined,
                      modified: getModifiedTime(filePath, stats),
                      size: isDir || shortcutUrl ? undefined : stats.size,
                    };
                  })
                )
              )
                .sort(
                  (a, b) =>
                    Number(b.icon === "folder") - Number(a.icon === "folder")
                )
                .sort((a, b) => {
                  const aIsFolder = a.icon === "folder";
                  const bIsFolder = b.icon === "folder";

                  if (aIsFolder === bIsFolder) {
                    const aName = basename(a.href);
                    const bName = basename(b.href);

                    if (isAscending) return aName < bName ? -1 : 1;

                    return aName > bName ? -1 : 1;
                  }

                  return 0;
                })
                .sort((a, b) => {
                  if (!column || column === "N") return 0;

                  const sortValue = (
                    getValue: (entry: DirectoryEntries) => number | string
                  ): number => {
                    const aValue = getValue(a);
                    const bValue = getValue(b);

                    if (aValue === bValue) return 0;
                    if (isAscending) return aValue < bValue ? -1 : 1;

                    return aValue > bValue ? -1 : 1;
                  };

                  if (column === "S") {
                    return sortValue(({ size }) => size ?? 0);
                  }

                  if (column === "M") {
                    return sortValue(({ modified }) => modified ?? 0);
                  }

                  if (column === "D") {
                    return sortValue(({ description }) => description ?? "");
                  }

                  return 0;
                })
                .sort(
                  (a, b) =>
                    Number(b.icon === "folder") - Number(a.icon === "folder")
                );

              iframeRef.current?.addEventListener(
                "load",
                () => {
                  try {
                    contentWindow.document.body
                      .querySelectorAll("a")
                      .forEach((a) => {
                        a.addEventListener("click", (event) => {
                          event.preventDefault();

                          const target =
                            event.currentTarget as HTMLAnchorElement;
                          const isDir =
                            target.getAttribute("type") === "folder";
                          const { origin, pathname, search } = new URL(
                            target.href
                          );

                          if (search) {
                            goToLink(
                              `${origin}${encodeURI(directory)}${search}`
                            );
                          } else if (isDir) {
                            goToLink(target.href);
                          } else if (fs && target.href) {
                            getInfoWithExtension(
                              fs,
                              decodeURI(pathname),
                              getExtension(pathname),
                              ({ pid, url: infoUrl }) => {
                                open(pid || "OpenWith", { url: infoUrl });

                                if (pid && infoUrl) {
                                  updateRecentFiles(infoUrl, pid);
                                }
                              }
                            );
                          }
                        });
                      });
                  } catch {
                    // Ignore failure to add click event listeners
                  }
                },
                ONE_TIME_PASSIVE_EVENT
              );

              newSrcDoc = createDirectoryIndex(
                directory,
                processedUrl.origin,
                searchParams,
                directory === "/"
                  ? dirStats
                  : [
                      {
                        href: resolve(directory, ".."),
                        icon: "back",
                      },
                      ...dirStats,
                    ]
              );

              newTitle = `Index of ${directory}`;
            }

            setSrcDoc(newSrcDoc);
            prependFileToTitle(newTitle);
          } else {
            const isGoogle = processedUrl.hostname.includes("google.com");

            if (isGoogle) {
              const googleUrl = new URL(processedUrl.href);
              if (!googleUrl.searchParams.has("igu")) {
                googleUrl.searchParams.set("igu", "1");
              }
              navigateIframe(googleUrl.href);
            } else {
              try {
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(processedUrl.href)}`;
                const proxyResponse = await fetch(proxyUrl);
                if (!proxyResponse.ok) throw new Error(`Proxy returned ${proxyResponse.status}`);
                const html = await proxyResponse.text();
                const rewritten = rewriteUrlsForProxy(html, processedUrl.href);
                const withNav = injectNavScript(rewritten);
                setIframeSrc("");
                setSrcDoc(withNav);
              } catch {
                navigateIframe(processedUrl.href);
              }
            }

            if (processedUrl.href.startsWith(GOOGLE_SEARCH_QUERY)) {
              prependFileToTitle(`${addressInput} - Google Search`);
            } else {
              prependFileToTitle(initialTitle || processedUrl.hostname);
            }

            if (addressInput.startsWith("ipfs://")) {
              setIcon(id, "/System/Icons/Favicons/ipfs.webp");
            } else {
              const favicon = new Image();
              const faviconUrl = `${processedUrl.origin}${FAVICON_BASE_PATH}`;

              favicon.addEventListener(
                "error",
                () => setIcon(id, processDirectory.Browser.icon),
                ONE_TIME_PASSIVE_EVENT
              );
              favicon.addEventListener(
                "load",
                () => setIcon(id, faviconUrl),
                ONE_TIME_PASSIVE_EVENT
              );
              favicon.decoding = "async";
              favicon.src = faviconUrl;
            }
          }
        }
      }
    },
    [
      exists,
      fs,
      goToLink,
      id,
      initialTitle,
      navigateIframe,
      open,
      prependFileToTitle,
      readFile,
      readdir,
      setIcon,
      stat,
      updateRecentFiles,
    ]
  );

  useEffect(() => {
    if (process && history[position] !== currentUrl.current) {
      currentUrl.current = history[position];
      setUrl(history[position]);
    }
  }, [history, position, process, setUrl]);

  useEffect(() => {
    if (iframeRef.current) {
      linkElement(id, "peekElement", iframeRef.current);
    }
  }, [id, linkElement]);

  // Listen for intercepted link clicks from proxied pages
  useEffect(() => {
    const handleMessage = ({ data }: MessageEvent): void => {
      const navUrl = (data as Record<string, unknown> | undefined)?.__pyhdraNav;
      if (typeof navUrl === "string") {
        goToLink(navUrl);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [goToLink]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#1a1a1a]">
      {/* Chrome tab bar */}
      <div className="flex h-[36px] flex-shrink-0 items-end bg-[#35363a] pl-2 pr-1">
        <div className="flex h-[32px] items-center gap-1.5 rounded-t-[8px] bg-[#45474c] px-3">
          <Globe className="h-[14px] w-[14px] flex-shrink-0 text-[#9aa0a6]" />
          <span className="max-w-[180px] truncate text-[12px] text-[#e8eaed]">
            {initialTitle || "New Tab"}
          </span>
        </div>
        <button
          aria-label="New tab"
          className="ml-1 mb-[4px] flex h-[24px] w-[24px] items-center justify-center rounded-full text-[#9aa0a6] hover:bg-white/[0.12] hover:text-[#e8eaed]"
          onClick={() => open("Browser", {})}
          type="button"
        >
          <span className="text-[16px] leading-none">+</span>
        </button>
      </div>

      {/* Chrome toolbar */}
      <div className="flex h-[44px] flex-shrink-0 items-center gap-1.5 bg-[#35363a] px-3">
        {/* Navigation buttons */}
        <button
          className={cn(
            "flex h-[28px] w-[28px] items-center justify-center rounded-full transition-colors",
            canGoBack
              ? "text-[#e8eaed] hover:bg-white/[0.12] active:bg-white/[0.18]"
              : "text-white/[0.22]"
          )}
          disabled={!canGoBack}
          onClick={() => changeHistory(-1)}
          {...backMenu}
          aria-label="Go back"
          type="button"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <button
          className={cn(
            "flex h-[28px] w-[28px] items-center justify-center rounded-full transition-colors",
            canGoForward
              ? "text-[#e8eaed] hover:bg-white/[0.12] active:bg-white/[0.18]"
              : "text-white/[0.22]"
          )}
          disabled={!canGoForward}
          onClick={() => changeHistory(1)}
          {...forwardMenu}
          aria-label="Go forward"
          type="button"
        >
          <ArrowRight className="h-[18px] w-[18px]" />
        </button>
        <button
          aria-label="Reload"
          className={cn(
            "flex h-[28px] w-[28px] items-center justify-center rounded-full transition-colors",
            loading
              ? "text-white/[0.22]"
              : "text-[#e8eaed] hover:bg-white/[0.12] active:bg-white/[0.18]"
          )}
          disabled={loading}
          onClick={() => setUrl(history[position])}
          onContextMenu={haltEvent}
          type="button"
        >
          {loading ? (
            <X className="h-[16px] w-[16px]" />
          ) : (
            <RotateCw className="h-[16px] w-[16px]" />
          )}
        </button>

        {/* Chrome-style Omnibox */}
        <div
          className={cn(
            "mx-2 flex h-[34px] flex-1 items-center gap-2.5 rounded-full bg-[#45474c] px-4 transition-all",
            "ring-1 ring-transparent",
            "hover:bg-[#4a4d52]",
            "focus-within:bg-[#45474c] focus-within:ring-[#8ab4f8]"
          )}
        >
          <Globe className="h-[14px] w-[14px] flex-shrink-0 text-[#9aa0a6]" />
          <input
            ref={inputRef}
            className="flex-1 border-none bg-transparent text-[13.5px] font-normal text-[#e8eaed] outline-none placeholder:text-[#9aa0a6]"
            defaultValue={initialUrl}
            onFocusCapture={() => inputRef.current?.select()}
            onKeyDown={({ key }) => {
              if (inputRef.current && key === "Enter") {
                changeUrl(id, inputRef.current.value);
                if (currentUrl.current === inputRef.current.value) {
                  setUrl(inputRef.current.value);
                }
                window.getSelection()?.removeAllRanges();
                inputRef.current.blur();
              }
            }}
            {...ADDRESS_INPUT_PROPS}
          />
          {loading && (
            <div className="h-[14px] w-[14px] flex-shrink-0 animate-spin rounded-full border-[2px] border-[#8ab4f8]/30 border-t-[#8ab4f8]" />
          )}
        </div>
      </div>

      {/* Content */}
      <iframe
        ref={iframeRef}
        className={cn("flex-1 border-0", srcDoc ? "bg-white" : "bg-[#1a1a1a]")}
        onLoad={() => {
          try {
            iframeRef.current?.contentWindow?.addEventListener("focus", () =>
              setForegroundId(id)
            );
          } catch {
            // Ignore failure to add focus event listener
          }

          if (loading) setLoading(false);
        }}
        src={iframeSrc || undefined}
        srcDoc={srcDoc || undefined}
        title={id}
        {...IFRAME_CONFIG}
      />
    </div>
  );
};

export default memo(Browser);

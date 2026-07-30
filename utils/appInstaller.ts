import { basename, dirname, join } from "path";
import { unzip } from "utils/zipFunctions";
import { DESKTOP_PATH, START_MENU_PATH } from "utils/constants";
import { createShortcut } from "components/system/Files/FileEntry/functions";

export type AppManifest = {
  allowResizing?: boolean;
  backgroundColor?: string;
  entry: string;
  height?: number;
  hideCloseButton?: boolean;
  hideMaximizeButton?: boolean;
  hideMinimizeButton?: boolean;
  hideTitlebar?: boolean;
  icon?: string;
  id: string;
  name: string;
  source?: "appstore" | "external";
  width?: number;
};

type FileSystemFunctions = {
  exists: (path: string) => Promise<boolean>;
  lstat: (path: string) => Promise<{ isDirectory: () => boolean }>;
  mkdirRecursive: (path: string) => Promise<void>;
  readFile: (path: string) => Promise<Buffer>;
  readdir: (path: string) => Promise<string[]>;
  rmdir: (path: string) => Promise<boolean>;
  unlink: (path: string) => Promise<boolean>;
  updateFolder: (folder: string, newFile?: string, oldFile?: string) => void;
  writeFile: (
    path: string,
    data: Buffer | string,
    overwrite?: boolean
  ) => Promise<boolean>;
};

type InstallResult = {
  appName?: string;
  error?: string;
  success: boolean;
};

type ProgressCallback = (step: string, percent: number) => void;

const PROGRAM_FILES = "/Program Files";
const INSTALLED_APPS_FILE = "/System/installed-apps.json";

const readInstalledApps = async (
  fs: FileSystemFunctions
): Promise<Record<string, AppManifest>> => {
  if (!(await fs.exists(INSTALLED_APPS_FILE))) return {};
  try {
    const data = (await fs.readFile(INSTALLED_APPS_FILE))?.toString();

    return JSON.parse(data || "{}") as Record<string, AppManifest>;
  } catch {
    return {};
  }
};

const writeInstalledApps = async (
  fs: FileSystemFunctions,
  apps: Record<string, AppManifest>
): Promise<void> => {
  await fs.mkdirRecursive(dirname(INSTALLED_APPS_FILE));
  await fs.writeFile(
    INSTALLED_APPS_FILE,
    JSON.stringify(apps, undefined, 2),
    true
  );
};

const findManifest = (
  zipData: Record<string, Uint8Array>
): { basePath: string; manifest: AppManifest } | undefined => {
  const keys = Object.keys(zipData);
  const manifestKey = keys.find(
    (key) => key === "manifest.json" || key.endsWith("/manifest.json")
  );

  if (!manifestKey) return undefined;

  try {
    const manifest = JSON.parse(
      Buffer.from(zipData[manifestKey]).toString()
    ) as AppManifest;
    const basePath =
      manifestKey === "manifest.json" ? "" : dirname(manifestKey);

    return { basePath, manifest };
  } catch {
    return undefined;
  }
};

const extractZipToFs = async (
  fs: FileSystemFunctions,
  zipData: Record<string, Uint8Array>,
  basePath: string,
  destDir: string,
  onProgress?: ProgressCallback
): Promise<void> => {
  await fs.mkdirRecursive(destDir);

  const entries = Object.entries(zipData).filter(([relativePath]) => {
    const cleanPath = basePath
      ? relativePath.startsWith(`${basePath}/`)
        ? relativePath.slice(basePath.length + 1)
        : relativePath.replace(`${basePath}/`, "")
      : relativePath;

    return cleanPath && !cleanPath.endsWith("/");
  });

  const total = entries.length;

  await Promise.all(
    entries.map(async ([relativePath, data], index) => {
      const cleanPath = basePath
        ? relativePath.startsWith(`${basePath}/`)
          ? relativePath.slice(basePath.length + 1)
          : relativePath.replace(`${basePath}/`, "")
        : relativePath;

      const fullPath = join(destDir, cleanPath);

      await fs.mkdirRecursive(dirname(fullPath));
      await fs.writeFile(fullPath, Buffer.from(data), true);
      onProgress?.(`Extracting ${cleanPath}`, Math.round((index / total) * 80));
    })
  );
};

const createShortcutFile = async (
  fs: FileSystemFunctions,
  manifest: AppManifest,
  appDir: string,
  shortcutDir: string
): Promise<void> => {
  const shortcutName = `${manifest.name}.url`;
  const shortcutPath = join(shortcutDir, shortcutName);
  const iconPath = manifest.icon
    ? join(appDir, manifest.icon)
    : "/System/Icons/loadedapp.svg";

  const shortcutContent = createShortcut({
    BaseURL: "LoadedApp",
    Comment: manifest.name,
    IconFile: iconPath,
    URL: appDir,
  });

  await fs.mkdirRecursive(shortcutDir);
  await fs.writeFile(shortcutPath, shortcutContent, true);
  fs.updateFolder(shortcutDir, shortcutName);
};

export const isAppPackage = async (zipBuffer: Buffer): Promise<boolean> => {
  try {
    const zipData = await unzip(zipBuffer);

    return Object.keys(zipData).some(
      (key) => key === "manifest.json" || key.endsWith("/manifest.json")
    );
  } catch {
    return false;
  }
};

export const installAppFromZip = async (
  fs: FileSystemFunctions,
  zipBuffer: Buffer,
  zipFileName: string,
  onProgress?: ProgressCallback,
  source: "appstore" | "external" = "external"
): Promise<InstallResult> => {
  try {
    onProgress?.("Reading archive", 5);
    const zipData = await unzip(zipBuffer);
    onProgress?.("Searching for manifest", 15);
    const manifestResult = findManifest(zipData);

    if (!manifestResult) {
      return {
        error: "This zip file is not a valid app package.",
        success: false,
      };
    }

    const { basePath, manifest } = manifestResult;

    if (!manifest.id || !manifest.name || !manifest.entry) {
      return {
        error: "This app package is missing required information.",
        success: false,
      };
    }

    const appDir = join(PROGRAM_FILES, manifest.id);

    onProgress?.("Extracting files", 20);
    await extractZipToFs(fs, zipData, basePath, appDir, onProgress);
    onProgress?.("Creating Start Menu shortcut", 85);
    await createShortcutFile(fs, manifest, appDir, START_MENU_PATH);
    onProgress?.("Creating Desktop shortcut", 90);
    await createShortcutFile(fs, manifest, appDir, DESKTOP_PATH);

    onProgress?.("Registering app", 95);
    const installedApps = await readInstalledApps(fs);

    installedApps[manifest.id] = { ...manifest, source };
    await writeInstalledApps(fs, installedApps);

    onProgress?.("Installation complete", 100);
    return { appName: manifest.name, success: true };
  } catch (error) {
    return {
      error: `Failed to install app: ${(error as Error).message}`,
      success: false,
    };
  }
};

const deleteRecursive = async (
  fs: FileSystemFunctions,
  path: string
): Promise<void> => {
  if (!(await fs.exists(path))) return;

  const stats = await fs.lstat(path);

  if (stats.isDirectory()) {
    const entries = await fs.readdir(path);

    await Promise.all(
      entries.map((entry) => deleteRecursive(fs, join(path, entry)))
    );
    await fs.rmdir(path);
  } else {
    await fs.unlink(path);
  }
};

export const uninstallApp = async (
  fs: FileSystemFunctions,
  appId: string
): Promise<InstallResult> => {
  try {
    const installedApps = await readInstalledApps(fs);
    const manifest = installedApps[appId];

    if (!manifest) {
      return { error: "App not found in registry", success: false };
    }

    const appDir = join(PROGRAM_FILES, appId);
    const startMenuShortcut = join(START_MENU_PATH, `${manifest.name}.url`);
    const desktopShortcut = join(DESKTOP_PATH, `${manifest.name}.url`);

    await deleteRecursive(fs, appDir);

    if (await fs.exists(startMenuShortcut)) {
      await fs.unlink(startMenuShortcut);
      fs.updateFolder(START_MENU_PATH, undefined, basename(startMenuShortcut));
    }

    if (await fs.exists(desktopShortcut)) {
      await fs.unlink(desktopShortcut);
      fs.updateFolder(DESKTOP_PATH, undefined, basename(desktopShortcut));
    }

    delete installedApps[appId];
    await writeInstalledApps(fs, installedApps);

    return { appName: manifest.name, success: true };
  } catch (error) {
    return {
      error: `Failed to uninstall app: ${(error as Error).message}`,
      success: false,
    };
  }
};

export const getInstalledApps = readInstalledApps;

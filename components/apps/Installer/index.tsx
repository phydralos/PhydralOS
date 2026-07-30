import { memo, useCallback, useMemo, useRef, useState } from "react";
import { m as motion, AnimatePresence } from "motion/react";
import {
  Package,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileArchive,
} from "lucide-react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import {
  installAppFromZip,
  isAppPackage,
  uninstallApp,
  getInstalledApps,
} from "utils/appInstaller";
import { notify } from "utils/notifications";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import { cn } from "utils/cn";

type InstalledApp = {
  id: string;
  name: string;
};

type InstallState = {
  message: string;
  percent: number;
  status: "complete" | "error" | "idle" | "installing" | "uninstalling";
};

const Installer: FC<ComponentProcessProps> = () => {
  const {
    exists,
    lstat,
    mkdirRecursive,
    readFile,
    readdir,
    rmdir,
    unlink,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [installState, setInstallState] = useState<InstallState>({
    message: "",
    percent: 0,
    status: "idle",
  });
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [showInstalled, setShowInstalled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fsFunctions = useMemo(
    () => ({ exists, lstat, mkdirRecursive, readFile, readdir, rmdir, unlink, updateFolder, writeFile }),
    [exists, lstat, mkdirRecursive, readFile, readdir, rmdir, unlink, updateFolder, writeFile]
  );

  const refreshInstalledApps = useCallback(async () => {
    const apps = await getInstalledApps(fsFunctions);
    setInstalledApps(
      Object.values(apps).map((app) => ({ id: app.id, name: app.name }))
    );
  }, [fsFunctions]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setInstallState({
        message: "Reading file...",
        percent: 0,
        status: "installing",
      });

      const buffer = Buffer.from(await file.arrayBuffer());

      const isApp = await isAppPackage(buffer);
      if (!isApp) {
        setInstallState({
          message: "This zip file is not a valid app package.",
          percent: 0,
          status: "error",
        });
        return;
      }

      const result = await installAppFromZip(
        fsFunctions,
        buffer,
        file.name,
        (step, percent) => {
          setInstallState({ message: step, percent, status: "installing" });
        }
      );

      if (result.success) {
        notify(
          "App Installed",
          `${result.appName} has been installed. Shortcuts added to Desktop and Start Menu.`
        );
        setInstallState({
          message: `${result.appName} installed successfully!`,
          percent: 100,
          status: "complete",
        });
        refreshInstalledApps();
      } else {
        setInstallState({
          message: result.error || "Installation failed",
          percent: 0,
          status: "error",
        });
      }
    },
    [fsFunctions, refreshInstalledApps]
  );

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) await handleFileSelect(file);
      // eslint-disable-next-line no-param-reassign
      event.target.value = "";
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file?.name.endsWith(".zip")) {
        await handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleUninstall = useCallback(
    async (appId: string, appName: string) => {
      setInstallState({
        message: `Uninstalling ${appName}...`,
        percent: 50,
        status: "uninstalling",
      });

      const result = await uninstallApp(fsFunctions, appId);

      if (result.success) {
        notify("App Uninstalled", `${appName} has been removed.`);
        setInstallState({
          message: `${appName} uninstalled successfully.`,
          percent: 100,
          status: "complete",
        });
        refreshInstalledApps();
      } else {
        setInstallState({
          message: result.error || "Uninstall failed",
          percent: 0,
          status: "error",
        });
      }
    },
    [fsFunctions, refreshInstalledApps]
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const toggleInstalled = useCallback(() => {
    setShowInstalled((prev) => {
      if (!prev) refreshInstalledApps();
      return !prev;
    });
  }, [refreshInstalledApps]);

  const statusIcon = {
    complete: <CheckCircle2 className="h-5 w-5 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    idle: undefined,
    installing: <Loader2 className="h-5 w-5 animate-spin text-sky-400" />,
    uninstalling: <Loader2 className="h-5 w-5 animate-spin text-red-400" />,
  };

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto bg-[#202020] text-[#f9fafb]"
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDrop={handleDrop}
      style={{ fontFamily: "'Montserrat', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif" }}
    >
      <input
        ref={fileInputRef}
        accept=".zip"
        className="hidden"
        onChange={handleInputChange}
        type="file"
      />

      {/* Hero Section */}
      <div className="flex flex-col items-center px-6 pt-10 pb-6">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-600/10 ring-1 ring-sky-400/20"
          initial={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4 }}
        >
          <Package className="h-8 w-8 text-sky-400" />
        </motion.div>
        <h1 className="text-xl font-extrabold tracking-tight">App Installer</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Select or drag a .zip file containing an app to install
        </p>
      </div>

      {/* Drop Zone + Actions */}
      <div className="flex flex-col items-center gap-3 px-6 pb-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex w-full max-w-[440px] flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all duration-200",
            isDragging
              ? "border-sky-400 bg-sky-400/10 scale-[1.02]"
              : "border-white/[0.08] bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]"
          )}
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3 }}
        >
          <FileArchive className={cn("h-10 w-10 transition-colors", isDragging ? "text-sky-400" : "text-muted-foreground")} />
          <div className="text-center">
            <div className="text-[13px] font-semibold">{isDragging ? "Drop to install" : "Drag & drop your .zip here"}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">or click browse below</div>
          </div>
          <Button
            className="mt-1 gap-2 rounded-full bg-sky-400 text-[13px] font-bold text-black hover:bg-sky-300 hover:shadow-lg hover:shadow-sky-400/30"
            onClick={openFilePicker}
            type="button"
          >
            <Upload className="h-4 w-4" /> Browse for App
          </Button>
        </motion.div>

        <button
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
            showInstalled
              ? "border-sky-400/40 bg-sky-400/10 text-sky-400"
              : "border-white/[0.06] bg-white/[0.04] text-muted-foreground hover:border-white/14 hover:text-foreground"
          )}
          onClick={toggleInstalled}
          type="button"
        >
          {showInstalled ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showInstalled ? "Hide Installed" : "Manage Installed"}
          {installedApps.length > 0 && (
            <span className="rounded-full bg-white/[0.08] px-1.5 text-[10px] font-bold">{installedApps.length}</span>
          )}
        </button>
      </div>

      {/* Status / Progress */}
      <AnimatePresence>
        {installState.status !== "idle" && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="px-6 pb-4"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className={cn(
              "flex flex-col gap-3 rounded-xl border p-4",
              installState.status === "error"
                ? "border-red-400/20 bg-red-400/[0.06]"
                : installState.status === "complete"
                  ? "border-green-400/20 bg-green-400/[0.06]"
                  : "border-white/[0.06] bg-white/[0.04]"
            )}>
              <div className="flex items-center gap-2.5">
                {statusIcon[installState.status]}
                <span className={cn(
                  "text-[13px] font-medium",
                  installState.status === "error" ? "text-red-400" : installState.status === "complete" ? "text-green-400" : "text-foreground"
                )}>
                  {installState.message}
                </span>
              </div>
              {(installState.status === "installing" || installState.status === "uninstalling") && (
                <div className="h-[5px] w-full overflow-hidden rounded-md bg-white/[0.06]">
                  <motion.div
                    animate={{ width: `${installState.percent}%` }}
                    className={cn(
                      "h-full rounded-md transition-all duration-300",
                      installState.status === "uninstalling"
                        ? "bg-gradient-to-r from-red-600 via-red-400 to-red-600"
                        : "bg-gradient-to-r from-sky-600 via-sky-400 to-sky-600"
                    )}
                    initial={{ width: 0 }}
                  />
                </div>
              )}
              {(installState.status === "installing" || installState.status === "uninstalling") && (
                <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                  <span>{installState.percent}%</span>
                  <span>{installState.status === "uninstalling" ? "Removing..." : "Processing..."}</span>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Installed Apps List */}
      <AnimatePresence>
        {showInstalled && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="px-6 pb-8"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="rounded-xl border-white/[0.06] bg-white/[0.04] p-4">
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Installed Apps
              </h2>
              {installedApps.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-[13px] text-muted-foreground">No external apps installed.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <AnimatePresence>
                    {installedApps.map((app) => (
                      <motion.div
                        key={app.id}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.03] p-3 transition-all hover:border-white/[0.08] hover:bg-white/[0.06]"
                        exit={{ opacity: 0, x: -20 }}
                        initial={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="truncate text-[13px] font-semibold">{app.name}</span>
                        </div>
                        <button
                          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-red-400/12 px-3 py-1.5 text-[11.5px] font-semibold text-red-400 transition-all hover:bg-red-400/20"
                          onClick={() => handleUninstall(app.id, app.name)}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Uninstall
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(Installer);

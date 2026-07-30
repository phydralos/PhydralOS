import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";
import { m as motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Home,
  LayoutGrid,
  Gamepad2,
  CloudDownload,
  Library,
  Search,
  Star,
  Share2,
  X,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Shield,
  Download,
} from "lucide-react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useAuthContext } from "contexts/auth";
import { useFileSystem } from "contexts/fileSystem";
import {
  getInstalledApps,
  installAppFromZip,
  uninstallApp,
} from "utils/appInstaller";
import { notify } from "utils/notifications";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { Card } from "components/ui/card";
import { cn } from "utils/cn";
import {
  CATEGORIES,
  type AppCategory,
  type AppReview,
  type AppStoreApp,
} from "components/apps/AppStore/mockData";
import {
  downloadApp,
  listAllApps,
} from "components/apps/AppStore/firebase";

type MainView = "apps" | "downloads" | "gaming" | "home" | "library" | "themes";

type SortOption = "name" | "price" | "rating";

type InstallProgress = {
  appId: string;
  message: string;
  percent: number;
};

type InstalledAppInfo = {
  id: string;
  name: string;
};

const EMPTY_ARRAY: string[] = [];

const BOTTOM_NAV: {
  icon: typeof Home;
  label: string;
  view: MainView;
}[] = [
  { icon: Home, label: "Home", view: "home" },
  { icon: LayoutGrid, label: "Apps", view: "apps" },
  { icon: Gamepad2, label: "Games", view: "gaming" },
  { icon: CloudDownload, label: "Downloads", view: "downloads" },
  { icon: Library, label: "Library", view: "library" },
];

const AppStore: FC<ComponentProcessProps> = () => {
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
  const { user, addPurchasedApp } = useAuthContext();

  const [detailApp, setDetailApp] = useState<AppStoreApp | undefined>();
  const [heroIndex, setHeroIndex] = useState(0);
  const [installProgress, setInstallProgress] = useState<
    InstallProgress | undefined
  >();
  const [installedApps, setInstalledApps] = useState<InstalledAppInfo[]>([]);
  const [libraryFilter, setLibraryFilter] = useState<"all" | "installed">(
    "all"
  );
  const [reviewComment, setReviewComment] = useState("");
  const [reviewModalApp, setReviewModalApp] = useState<
    AppStoreApp | undefined
  >();
  const [reviewRating, setReviewRating] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>("All");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [uninstallConfirmApp, setUninstallConfirmApp] = useState<
    AppStoreApp | undefined
  >();
  const [view, setView] = useState<MainView>("home");
  const [firebaseApps, setFirebaseApps] = useState<AppStoreApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  const purchasedAppIds = useMemo(
    () => user?.account?.purchasedAppIds ?? EMPTY_ARRAY,
    [user?.account?.purchasedAppIds]
  );
  const username = user?.account?.username ?? user?.displayName ?? "Guest";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    // eslint-disable-next-line consistent-return
    return (): void => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async (): Promise<void> => {
      const apps = await listAllApps();
      if (!cancelled) {
        setFirebaseApps(apps);
        setAppsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isNarrow = containerWidth <= 550;
  const isMedium = containerWidth <= 700;
  const isCompact = containerWidth <= 800;
  const isMobile = containerWidth <= 420;

  const fsFunctions = useMemo(
    () => ({
      exists,
      lstat,
      mkdirRecursive,
      readFile,
      readdir,
      rmdir,
      unlink,
      updateFolder,
      writeFile,
    }),
    [
      exists,
      lstat,
      mkdirRecursive,
      readFile,
      readdir,
      rmdir,
      unlink,
      updateFolder,
      writeFile,
    ]
  );

  const refreshInstalledApps = useCallback(async (): Promise<void> => {
    const apps = await getInstalledApps(fsFunctions);
    setInstalledApps(
      Object.values(apps).map((app) => ({ id: app.id, name: app.name }))
    );
  }, [fsFunctions]);

  useEffect(() => {
    refreshInstalledApps();
  }, [refreshInstalledApps]);

  const heroAppsList = useMemo(
    () =>
      firebaseApps.filter(
        (a) => a.isHero || a.isTrendingApp || a.isTrendingGame
      ),
    [firebaseApps]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(heroAppsList.length, 5));
    }, 6000);
    return (): void => clearInterval(timer);
  }, [heroAppsList.length]);

  const installedAppIds = useMemo(
    () => new Set(installedApps.map((a) => a.id)),
    [installedApps]
  );

  const isAppOwned = useCallback(
    (app: AppStoreApp): boolean =>
      purchasedAppIds.includes(app.id) || app.price === 0,
    [purchasedAppIds]
  );

  const handleInstall = useCallback(
    async (app: AppStoreApp): Promise<void> => {
      if (installProgress) return;
      if (!isAppOwned(app)) return;

      setInstallProgress({
        appId: app.id,
        message: "Preparing download...",
        percent: 5,
      });

      const result = await downloadApp(app.id, firebaseApps);

      if (result.success && result.blob) {
        const buffer = Buffer.from(await result.blob.arrayBuffer());
        const installResult = await installAppFromZip(
          fsFunctions,
          buffer,
          `${app.id}.zip`,
          (step, percent) => {
            setInstallProgress({ appId: app.id, message: step, percent });
          },
          "appstore"
        );

        if (installResult.success) {
          try {
            confetti({ particleCount: 70, spread: 60 });
          } catch {
            // ignore
          }
          notify(
            "App Installed",
            `${installResult.appName} has been installed successfully.`
          );
          refreshInstalledApps();
        } else {
          notify(
            "Installation Failed",
            installResult.error || "An error occurred during installation."
          );
        }
      } else {
        setInstallProgress({
          appId: app.id,
          message: "Downloading package...",
          percent: 50,
        });
        setTimeout(() => {
          setInstallProgress({
            appId: app.id,
            message: "Extracting resources...",
            percent: 90,
          });
          setTimeout(() => {
            try {
              confetti({ particleCount: 60, spread: 70 });
            } catch {
              // ignore
            }
            notify("App Store", `${app.name} installation simulated.`);
            setInstallProgress(undefined);
          }, 300);
        }, 300);
      }
    },
    [installProgress, isAppOwned, fsFunctions, refreshInstalledApps, firebaseApps]
  );

  const handleBuy = useCallback(
    async (app: AppStoreApp): Promise<void> => {
      if (installProgress) return;
      if (purchasedAppIds.includes(app.id)) return;

      const success = await addPurchasedApp(app.id, app.price);
      if (!success) {
        notify(
          "Purchase Failed",
          "Insufficient wallet balance. Please add funds."
        );
        return;
      }

      try {
        confetti({ particleCount: 100, spread: 80 });
      } catch {
        // ignore
      }
      notify("Purchase Complete", `${app.name} purchased for $${app.price}.`);
    },
    [installProgress, purchasedAppIds, addPurchasedApp]
  );

  const handleInstallOrBuy = useCallback(
    (app: AppStoreApp): void => {
      if (installedAppIds.has(app.id)) return;
      if (app.price === 0 || purchasedAppIds.includes(app.id)) {
        handleInstall(app);
      } else {
        handleBuy(app);
      }
    },
    [installedAppIds, purchasedAppIds, handleInstall, handleBuy]
  );

  const handleConfirmUninstall = useCallback(async (): Promise<void> => {
    if (!uninstallConfirmApp) return;
    const app = uninstallConfirmApp;
    setUninstallConfirmApp(undefined);
    const result = await uninstallApp(fsFunctions, app.id);
    if (result.success) {
      notify("App Uninstalled", `${app.name} has been removed.`);
      refreshInstalledApps();
    } else {
      notify("Uninstall Failed", result.error || "Unable to uninstall app.");
    }
  }, [uninstallConfirmApp, fsFunctions, refreshInstalledApps]);

  const handleSubmitReview = useCallback((): void => {
    if (!reviewModalApp || !reviewComment.trim()) return;
    const newRev: AppReview = {
      comment: reviewComment,
      date: new Date().toISOString().split("T")[0],
      id: `rev-${Date.now()}`,
      rating: reviewRating,
      userName: username,
    };
    reviewModalApp.reviews = [newRev, ...(reviewModalApp.reviews || [])];
    setReviewModalApp(undefined);
    setReviewComment("");
    notify("Review Submitted", "Thank you for rating this app!");
  }, [reviewModalApp, reviewComment, reviewRating, username]);

  const filteredApps = useMemo((): AppStoreApp[] => {
    let apps = [...firebaseApps];
    if (view === "gaming") {
      apps = apps.filter((app) => app.category === "Games");
    } else if (selectedCategory !== "All") {
      apps = apps.filter((app) => app.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      apps = apps.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.developer.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q)
      );
    }
    if (sortBy === "rating")
      {apps.sort((a, b) => (b.rating || 0) - (a.rating || 0));}
    else if (sortBy === "price") apps.sort((a, b) => a.price - b.price);
    else if (sortBy === "name")
      {apps.sort((a, b) => a.name.localeCompare(b.name));}
    return apps;
  }, [view, selectedCategory, searchQuery, sortBy, firebaseApps]);

  const currentHeroApp = heroAppsList[heroIndex] || heroAppsList[0];
  const featuredGridApps = useMemo(
    () => firebaseApps.filter((a) => a.isFeaturedGrid),
    [firebaseApps]
  );
  const trendingGames = useMemo(
    () => firebaseApps.filter((a) => a.isTrendingGame),
    [firebaseApps]
  );
  const trendingApps = useMemo(
    () => firebaseApps.filter((a) => a.isTrendingApp),
    [firebaseApps]
  );
  const discoverApps = useMemo(
    () => firebaseApps.filter((a) => a.isDiscoverMore),
    [firebaseApps]
  );

  const renderCompactCard = (app: AppStoreApp): React.ReactElement => {
    const isInstalled = installedAppIds.has(app.id);
    const isOwned = isAppOwned(app);
    return (
      <motion.button
        key={app.id}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.03] p-2.5 px-3 text-left transition-all duration-200",
          "hover:border-white/14 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5"
        )}
        initial={{ opacity: 0, y: 16 }}
        onClick={() => setDetailApp(app)}
        transition={{ duration: 0.35 }}
        type="button"
      >
        <div className={cn("flex-shrink-0 overflow-hidden rounded-2xl bg-white/[0.06]", isMobile ? "h-10 w-10" : "h-12 w-12")}>
          <img
            alt={app.name}
            className="h-full w-full object-cover"
            src={app.iconUrl}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="truncate text-[13px] font-semibold text-foreground">
            {app.name}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">
            {app.developer}
          </div>
          <div className="text-[11px] font-bold text-amber-400">
            {app.rating || 4.5} ★
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col gap-1">
          {isInstalled ? (
            <Badge
              className="bg-emerald-500/12 text-emerald-400"
              variant="secondary"
            >
              Installed
            </Badge>
          ) : isOwned ? (
            <Badge
              className="bg-sky-500/12 text-sky-400"
              variant="secondary"
            >
              Owned
            </Badge>
          ) : app.price === 0 ? (
            <Badge variant="outline">Free</Badge>
          ) : (
            <Badge variant="outline">${app.price}</Badge>
          )}
        </div>
      </motion.button>
    );
  };

  const renderHomeView = (): React.ReactElement => (
    <>
      <div
        className={cn(
          "mb-2 grid gap-3",
          isCompact ? "grid-cols-1" : "grid-cols-[1.8fr_1fr]"
        )}
      >
        <motion.button
          key={currentHeroApp?.id}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "relative flex items-end overflow-hidden rounded-2xl border border-white/[0.06] text-left transition-all duration-300",
            "hover:border-white/14 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1",
            "bg-gradient-to-br from-[#0d3b1f] via-[#0a2a16] to-[#06120a]",
            isMobile ? "min-h-[180px] p-4" : isNarrow ? "min-h-[220px] p-5" : "min-h-[300px] p-7 px-8"
          )}
          initial={{ opacity: 0, scale: 1.04 }}
          onClick={() => setDetailApp(currentHeroApp)}
          transition={{ duration: 0.6 }}
          type="button"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-full w-[55%] opacity-55 transition-all duration-500 [mask-image:linear-gradient(to_left,rgba(0,0,0,0.5),transparent)]">
            <img
              alt="hero"
              className="h-full w-full object-cover"
              src={currentHeroApp?.iconUrl}
            />
          </div>
          <div
            className={cn(
              "relative z-[2] flex flex-col gap-2",
              isMobile ? "max-w-[90%]" : isNarrow ? "max-w-[85%]" : "max-w-[65%]"
            )}
          >
            <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <Award className="h-3.5 w-3.5" /> Editor&apos;s Choice
            </div>
            <div
              className={cn(
                "font-extrabold leading-tight tracking-tight drop-shadow-lg",
                isMobile ? "text-lg" : isNarrow ? "text-xl" : "text-2xl"
              )}
            >
              {currentHeroApp?.name}
            </div>
            <div className={cn("text-[12px] font-normal leading-snug text-white/75", isMobile ? "max-w-[280px]" : "max-w-[400px]")}>
              {currentHeroApp?.tagline}
            </div>
            <button
              className={cn("mt-1 self-start rounded-full bg-emerald-500 text-[12px] font-bold text-white transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105", isMobile ? "px-5 py-1.5" : "px-7 py-2")}
              onClick={(e) => {
                e.stopPropagation();
                handleInstallOrBuy(currentHeroApp);
              }}
              type="button"
            >
              {installedAppIds.has(currentHeroApp?.id || "")
                ? "Installed"
                : currentHeroApp?.price === 0
                  ? "Get"
                  : `Buy $${currentHeroApp?.price}`}
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-white/50">
              <span className="rounded-[3px] border border-white/30 px-1 py-px font-extrabold">
                IARC
              </span>
              <span>{currentHeroApp?.ageRating || "3+ In-App Purchases"}</span>
            </div>
          </div>
          <div className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 gap-1.5">
            {heroAppsList.slice(0, 5).map((app, idx) => (
              <button
                key={app.id}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-300",
                  idx === heroIndex
                    ? "w-5 rounded bg-emerald-400"
                    : "bg-white/30 hover:bg-white/60"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroIndex(idx);
                }}
                type="button"
              />
            ))}
          </div>
        </motion.button>

        <div className="flex flex-col gap-3">
          {featuredGridApps[0] && (
            <button
              className={cn(
                "relative flex min-h-[120px] flex-[1.3] flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.06] p-4 text-left transition-all duration-300",
                "hover:border-white/14 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/35",
                "bg-gradient-to-br from-[#1d3a24] to-[#0e1e12]"
              )}
              onClick={() => setDetailApp(featuredGridApps[0])}
              type="button"
            >
              <div className="absolute right-0 top-0 h-full w-[60%] opacity-30 transition-all duration-400">
                <img
                  alt="feature"
                  className="h-full w-full object-cover"
                  src={featuredGridApps[0].iconUrl}
                />
              </div>
              <div className="relative z-[2]">
                <div className="mb-2.5 text-[17px] font-bold">
                  {featuredGridApps[0].name}
                </div>
                <button
                  className="rounded-2xl bg-emerald-500 px-5 py-1.5 text-[11.5px] font-bold text-white transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInstallOrBuy(featuredGridApps[0]);
                  }}
                  type="button"
                >
                  Get
                </button>
              </div>
            </button>
          )}
          <div className="grid flex-1 grid-cols-2 gap-3">
            {featuredGridApps.slice(1, 3).map((app) => (
              <button
                key={app.id}
                className={cn(
                  "relative flex min-h-[90px] flex-col justify-end overflow-hidden rounded-xl border border-white/[0.06] bg-[#1a1a1a] p-3 text-left transition-all duration-200",
                  "hover:border-white/14 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
                )}
                onClick={() => setDetailApp(app)}
                type="button"
              >
                <div className="absolute inset-0 opacity-25 transition-opacity hover:opacity-40">
                  <img
                    alt={app.name}
                    className="h-full w-full object-cover"
                    src={app.iconUrl}
                  />
                </div>
                <div className="relative z-[2] text-xs font-bold drop-shadow-lg">
                  {app.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={cn("mb-3 flex items-center justify-between", isMobile ? "mt-5" : "mt-7 mb-4")}>
        <div className={cn("flex cursor-pointer items-center gap-2 font-bold tracking-tight transition-colors hover:text-emerald-400", isMobile ? "text-base" : "text-xl")}>
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Trending games
          <ChevronRight className="h-[18px] w-[18px] text-emerald-400 transition-transform hover:translate-x-1" />
        </div>
      </div>
      <div
        className={cn(
          "mb-2 grid gap-2.5",
          isMobile
            ? "grid-cols-1"
            : isNarrow
              ? "grid-cols-1"
              : "grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
        )}
      >
        {trendingGames.map((app) => renderCompactCard(app))}
      </div>

      <div className={cn("mb-3 flex items-center justify-between", isMobile ? "mt-5" : "mt-7 mb-4")}>
        <div className={cn("flex cursor-pointer items-center gap-2 font-bold tracking-tight transition-colors hover:text-sky-400", isMobile ? "text-base" : "text-xl")}>
          <TrendingUp className="h-4 w-4 text-sky-400" />
          Trending apps
          <ChevronRight className="h-[18px] w-[18px] text-sky-400 transition-transform hover:translate-x-1" />
        </div>
      </div>
      <div
        className={cn(
          "mb-2 grid gap-2.5",
          isMobile
            ? "grid-cols-1"
            : isNarrow
              ? "grid-cols-1"
              : "grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
        )}
      >
        {trendingApps.map((app) => renderCompactCard(app))}
      </div>
    </>
  );

  const renderAppsGridView = (): React.ReactElement => (
    <>
      <div className={cn("flex items-center justify-between", isMobile ? "mt-4 mb-3" : "mt-7 mb-4")}>
        <div className={cn("font-bold tracking-tight", isMobile ? "text-base" : "text-xl")}>
          {view === "gaming" ? "Games" : "Apps"}
          {selectedCategory !== "All" && ` — ${selectedCategory}`}
        </div>
        <div className="flex gap-2">
          <select
            className={cn(
              "rounded-full border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-[11.5px] font-semibold text-white",
              "outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            )}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            value={sortBy}
          >
            <option value="rating">Sort by Rating</option>
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>
        </div>
      </div>
      <div className={cn("mb-4 flex flex-wrap gap-2", isMobile && "flex-nowrap overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden")}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
              selectedCategory === cat
                ? "border-emerald-400 bg-emerald-400/12 text-emerald-400"
                : "border-white/[0.04] bg-white/[0.04] text-muted-foreground hover:border-white/14 hover:text-foreground"
            )}
            onClick={() => setSelectedCategory(cat)}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>
      <div
        className={cn(
          "grid gap-2.5",
          isMobile
            ? "grid-cols-1"
            : isNarrow
              ? "grid-cols-1"
              : "grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
        )}
      >
        {filteredApps.map((app) => renderCompactCard(app))}
      </div>
    </>
  );

   
  const renderDetailView = (): React.ReactElement | undefined => {
    if (!detailApp) return undefined;

    const app = detailApp;
    const isInstalled = installedAppIds.has(app.id);
    const isOwned = isAppOwned(app);
    const isInstalling = installProgress?.appId === app.id;
    const osVal = app.sysReqs ? app.sysReqs.os : "Windows 10 / 11";
    const archVal = app.sysReqs ? app.sysReqs.architecture : "x64, ARM64";
    const memVal = app.sysReqs ? app.sysReqs.memory : "8 GB RAM";
    const gpuVal = app.sysReqs ? app.sysReqs.graphics : "DirectX 12 Compatible";
    const hasReviews = app.reviews ? app.reviews.length > 0 : false;

    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.3 }}
      >
        <button
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-all hover:text-emerald-400 hover:-translate-x-0.5"
          onClick={() => setDetailApp(undefined)}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" /> Back to store
        </button>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex gap-4 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-emerald-500/[0.06] via-[#1a1a1a] to-[#141414]",
            isMobile ? "flex-col items-center gap-3 p-4 text-center" : isCompact ? "flex-col items-center p-5 text-center" : "p-7"
          )}
          initial={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.35 }}
        >
          <div className={cn("flex-shrink-0 overflow-hidden rounded-2xl border border-white/14 bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] shadow-xl shadow-black/50 transition-transform hover:scale-105", isMobile ? "h-[80px] w-[80px] p-2.5" : "h-[110px] w-[110px] p-3.5")}>
            <img
              alt={app.name}
              className="h-full w-full object-contain"
              src={app.iconUrl}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div
              className={cn(
                "font-extrabold leading-tight tracking-tight",
                isMobile ? "text-lg" : isNarrow ? "text-xl" : "text-2xl"
              )}
            >
              {app.name}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {app.developer}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                {app.rating || 4.8} ★
                <span className="font-normal text-gray-400">
                  {" "}
                  ({app.ratingCount || 913} ratings)
                </span>
              </span>
              <span className="cursor-pointer font-medium text-emerald-400 hover:underline">
                {app.category}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-1.5">
              {(app.badges || ["Built for Copilot+ PC", "Uses AI features"]).map(
                (b) => (
                  <span
                    key={b}
                    className="flex items-center gap-1 rounded-2xl bg-white/[0.08] px-2.5 py-0.5 text-[10.5px] font-medium text-muted-foreground"
                  >
                    ❖ {b}
                  </span>
                )
              )}
            </div>
            <div className={cn("mt-0.5 max-w-[560px] text-[13px] leading-relaxed text-foreground/80", isMobile && "max-w-none")}>
              {app.tagline || app.description}
            </div>
            <div className={cn("mt-3 flex flex-wrap items-center gap-2.5", isMobile && "justify-center")}>
              {isInstalling ? (
                <Button
                  className="rounded-full bg-zinc-700 text-muted-foreground"
                  disabled
                >
                  Installing... ({installProgress?.percent}%)
                </Button>
              ) : isInstalled ? (
                <Button
                  className="rounded-full bg-emerald-500 text-white hover:bg-emerald-400"
                  disabled
                >
                  Installed
                </Button>
              ) : (
                <Button
                  className="rounded-full bg-emerald-500 px-9 text-[13px] font-bold text-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
                  onClick={() => handleInstallOrBuy(app)}
                  type="button"
                >
                  {isOwned
                    ? "Install"
                    : app.price === 0
                      ? "Install"
                      : `Buy $${app.price}`}
                </Button>
              )}
              <Button
                className="h-9 gap-1 rounded-full border border-white/[0.08] bg-white/[0.08] px-3.5 text-xs font-medium text-foreground hover:bg-white/[0.08] hover:border-white/14"
                onClick={() => setReviewModalApp(app)}
                variant="outline"
              >
                <Star className="h-3.5 w-3.5" /> Rate &amp; Review
              </Button>
              <Button
                className="h-9 gap-1 rounded-full border border-white/[0.08] bg-white/[0.08] px-3.5 text-xs font-medium text-foreground hover:bg-white/[0.08] hover:border-white/14"
                onClick={() => {
                  notify(
                    "Link Copied",
                    `Share link for ${app.name} copied to clipboard.`
                  );
                }}
                variant="outline"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Provided and updated by {app.developer}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/[0.06] px-2.5 py-1">
              <span className="rounded-[2px] border border-muted-foreground px-1 py-px text-[8px] font-extrabold">
                IARC
              </span>
              <span className="text-[11px] text-foreground/80">
                {app.ageRating || "12+ Horror In-App Purchases"}
              </span>
            </div>
          </div>
        </motion.div>

        {isInstalling && (
          <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3.5">
            <div className="h-[5px] w-full overflow-hidden rounded-md bg-white/[0.06]">
              <div
                className="h-full rounded-md bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 bg-[length:200%_100%] transition-all duration-300"
                style={{ width: `${installProgress?.percent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
              <span>{installProgress?.message}</span>
              <span>{installProgress?.percent}%</span>
            </div>
          </div>
        )}

        <div
          className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : isCompact ? "grid-cols-1" : "grid-cols-[2.2fr_1fr]"
          )}
        >
          <div className="flex flex-col gap-3">
            <Card className={cn("rounded-2xl border-white/[0.04] bg-white/[0.03]", isMobile ? "p-3.5" : "p-5")}>
              <div className="mb-3 flex items-center justify-between text-[15px] font-bold">
                <span>Screenshots</span>
                <ChevronRight className="h-4 w-4" />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1.5 [scroll-snap-type:x_mandatory]">
                {(app.screenshots || [
                  "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
                  "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80",
                ]).map((src) => (
                  <div
                    key={src}
                    className={cn(
                      "flex-shrink-0 overflow-hidden rounded-xl [scroll-snap-align:start]",
                      isMobile
                        ? "h-[140px] w-[220px]"
                        : isNarrow
                          ? "h-[160px] w-[260px]"
                          : "h-[200px] w-[340px]"
                    )}
                  >
                    <img
                      alt="screenshot preview"
                      className="h-full w-full object-cover transition-transform duration-400 hover:scale-105"
                      src={src}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className={cn("rounded-2xl border-white/[0.04] bg-white/[0.03]", isMobile ? "p-3.5" : "p-5")}>
              <h3 className="mb-2 text-[14px] font-bold">Description</h3>
              <p className="text-[12.5px] leading-relaxed text-foreground/80">
                {app.description}
              </p>
            </Card>

            <Card className={cn("rounded-2xl border-white/[0.04] bg-white/[0.03]", isMobile ? "p-3.5" : "p-5")}>
              <div className={cn("mb-2.5 flex items-center gap-2", isMobile && "mb-2")}>
                <Shield className="h-4 w-4 text-emerald-400" />
                <h3 className={cn("font-bold", isMobile ? "text-[14px]" : "text-[15px]")}>
                  System Requirements
                </h3>
              </div>
              <div
                className={cn(
                  "grid gap-3",
                  isMobile ? "grid-cols-1" : isNarrow ? "grid-cols-1" : "grid-cols-2"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    OS
                  </span>
                  <span className="text-[13px] font-medium">{osVal}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Architecture
                  </span>
                  <span className="text-[13px] font-medium">{archVal}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Memory
                  </span>
                  <span className="text-[13px] font-medium">{memVal}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Graphics
                  </span>
                  <span className="text-[13px] font-medium">{gpuVal}</span>
                </div>
              </div>
            </Card>

            <Card className={cn("rounded-2xl border-white/[0.04] bg-white/[0.03]", isMobile ? "p-3.5" : "p-5")}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className={cn("font-bold", isMobile ? "text-[14px]" : "text-[15px]")}>Ratings &amp; Reviews</h3>
                <button
                  className="rounded-2xl bg-emerald-500 px-3.5 py-1 text-[11.5px] font-bold text-white transition-all hover:bg-emerald-400"
                  onClick={() => setReviewModalApp(app)}
                  type="button"
                >
                  Write a review
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {hasReviews ? (
                  app.reviews?.map((rev) => (
                    <div
                      key={rev.id}
                      className="flex flex-col gap-0.5 rounded-xl bg-white/[0.06] p-3 transition-colors hover:bg-white/[0.08]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{rev.userName}</span>
                        <span className="text-xs text-amber-400">
                          {"★".repeat(rev.rating)}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {rev.date}
                      </div>
                      <div className="mt-1 text-[12.5px] leading-relaxed text-foreground/80">
                        {rev.comment}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No customer reviews yet. Be the first to review!
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            <div className={cn("flex items-center gap-1.5 font-bold", isMobile ? "text-[14px]" : "text-[15px]")}>
              Discover more{" "}
              <ChevronRight className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex flex-col gap-2">
              {discoverApps.map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.03] p-2.5 px-3 text-left transition-all",
                    "hover:bg-white/[0.06] hover:border-white/[0.06]"
                  )}
                  onClick={() => setDetailApp(item)}
                  type="button"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <img
                      alt={item.name}
                      className="h-9 w-9 flex-shrink-0 rounded-xl bg-white/[0.06] object-cover"
                      src={item.iconUrl}
                    />
                    <span className="truncate text-[12.5px] font-semibold">
                      {item.name}
                    </span>
                  </div>
                  <span className="flex-shrink-0 rounded-[10px] bg-white/[0.08] px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                    {installedAppIds.has(item.id)
                      ? "Installed"
                      : isAppOwned(item)
                        ? "Owned"
                        : "Free"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderLibraryView = (): React.ReactElement => {
    let owned = firebaseApps.filter(
      (app) =>
        installedAppIds.has(app.id) || purchasedAppIds.includes(app.id)
    );
    if (libraryFilter === "installed") {
      owned = owned.filter((app) => installedAppIds.has(app.id));
    }
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.3 }}
      >
        <div className={cn("font-extrabold tracking-tight", isMobile ? "text-lg" : "text-2xl")}>Library</div>
        <div className="flex flex-wrap gap-2">
          <button
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
              libraryFilter === "all"
                ? "border-emerald-400 bg-emerald-400/12 text-emerald-400"
                : "border-white/[0.04] bg-white/[0.04] text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setLibraryFilter("all")}
            type="button"
          >
            All owned ({purchasedAppIds.length + installedApps.length})
          </button>
          <button
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
              libraryFilter === "installed"
                ? "border-emerald-400 bg-emerald-400/12 text-emerald-400"
                : "border-white/[0.04] bg-white/[0.04] text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setLibraryFilter("installed")}
            type="button"
          >
            Installed ({installedApps.length})
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {owned.map((app) => {
            const isInstalled = installedAppIds.has(app.id);
            return (
              <div
                key={app.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.03] p-3 px-3.5 transition-all hover:bg-white/[0.06] hover:border-white/[0.06]",
                  isMobile && "flex-col gap-2.5 items-start"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    alt={app.name}
                    className={cn("flex-shrink-0 rounded-xl bg-white/[0.06] object-cover", isMobile ? "h-10 w-10" : "h-11 w-11")}
                    src={app.iconUrl}
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="truncate text-sm font-semibold">
                      {app.name}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {app.developer} • v{app.version} •{" "}
                      {app.size ?? "100 MB"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  {!isInstalled && (
                    <button
                      className="rounded-2xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
                      onClick={() => handleInstallOrBuy(app)}
                      type="button"
                    >
                      Install
                    </button>
                  )}
                  {isInstalled && (
                    <button
                      className="rounded-2xl bg-red-400/12 px-4 py-1.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-400/20"
                      onClick={() => setUninstallConfirmApp(app)}
                      type="button"
                    >
                      Uninstall
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const renderDownloadsView = (): React.ReactElement => (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn("font-extrabold tracking-tight", isMobile ? "text-lg" : "text-2xl")}>
        Downloads &amp; Updates
      </div>
      {installProgress ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <strong className="flex items-center gap-1.5 text-foreground">
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              Downloading {installProgress.appId}
            </strong>
            <span>{installProgress.percent}%</span>
          </div>
          <div className="h-[5px] w-full overflow-hidden rounded-md bg-white/[0.06]">
            <div
              className="h-full rounded-md bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 bg-[length:200%_100%] transition-all duration-300"
              style={{ width: `${installProgress.percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>{installProgress.message}</span>
            <span>Speed: 18.5 MB/s</span>
          </div>
        </div>
      ) : (
        <div className="py-6 text-muted-foreground">
          All apps up to date. No active downloads.
        </div>
      )}
    </motion.div>
  );

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col overflow-hidden bg-[#141414] text-[#f9fafb] select-none"
      style={{
        fontFamily:
          "'Montserrat', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
        fontSize: 13,
        letterSpacing: "0.01em",
      }}
    >
      {/* Header */}
      <div className="z-20 flex h-[50px] flex-shrink-0 items-center border-b border-white/[0.06] bg-[rgba(20,20,20,0.85)] px-4 backdrop-blur-xl backdrop-saturate-180">
        <div className="flex w-full items-center rounded-full border border-white/[0.06] bg-white/[0.06] px-4 transition-all focus-within:border-emerald-400 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-emerald-400/20">
          <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <input
            className="flex-1 border-none bg-transparent px-2 py-1.5 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, games, and more"
            type="text"
            value={searchQuery}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex min-w-0 flex-1 overflow-y-auto bg-[#141414] pb-20 scroll-smooth [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb:hover]:bg-white/18",
          isMobile ? "px-3 py-3" : isMedium ? "px-3.5 py-4" : "px-5 py-5"
        )}
      >
        {appsLoading ? (
          <div className="flex w-full flex-col gap-4">
            {["a", "b", "c", "d", "e", "f"].map((key) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.03] p-3 px-3.5"
              >
                <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-2xl bg-white/[0.08]" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/[0.08]" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-2.5 w-1/4 animate-pulse rounded bg-white/[0.06]" />
                </div>
                <div className="h-6 w-14 flex-shrink-0 animate-pulse rounded-full bg-white/[0.08]" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={detailApp?.id || view}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {detailApp
                ? renderDetailView()
                : view === "home"
                  ? renderHomeView()
                  : view === "library"
                    ? renderLibraryView()
                    : view === "downloads"
                      ? renderDownloadsView()
                      : renderAppsGridView()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex h-[56px] flex-shrink-0 items-center justify-around border-t border-white/[0.06] bg-[rgba(20,20,20,0.95)] backdrop-blur-xl backdrop-saturate-180">
        {BOTTOM_NAV.map(({ icon: Icon, label, view: v }) => (
          <button
            key={v}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[9px] font-semibold transition-all",
              view === v && !detailApp
                ? "text-emerald-400"
                : "text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
            )}
            onClick={() => {
              setView(v);
              setDetailApp(undefined);
            }}
            type="button"
          >
            <div className="relative">
              <Icon className="h-5 w-5 transition-transform hover:scale-110" />
              {v === "downloads" && installProgress && (
                <span className="absolute -right-1.5 -top-1 animate-pulse rounded-full bg-red-500 px-1 text-[8px] font-extrabold text-white">
                  1
                </span>
              )}
            </div>
            <span>{label}</span>
            {view === v && !detailApp && (
              <div className="absolute -top-px h-[2px] w-8 rounded-full bg-emerald-400" />
            )}
          </button>
        ))}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalApp && (
          <motion.button
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] flex h-full w-full items-center justify-center bg-black/55 backdrop-blur-md"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setReviewModalApp(undefined)}
            transition={{ duration: 0.2 }}
            type="button"
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex w-[92%] max-w-[440px] flex-col gap-3.5 rounded-3xl border border-white/14 bg-[rgba(30,30,30,0.96)] p-7 shadow-2xl shadow-black/70"
              initial={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.25 }}
            >
              <button
                className="absolute right-4 top-4 text-muted-foreground transition-all hover:text-foreground hover:scale-110"
                onClick={() => setReviewModalApp(undefined)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-lg font-bold tracking-tight">
                Review {reviewModalApp.name}
              </div>
              <div className="text-[13px] leading-relaxed text-foreground/80">
                Select rating stars and leave your feedback:
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={cn(
                      "text-2xl transition-all hover:scale-110",
                      star <= reviewRating
                        ? "text-amber-400 scale-110"
                        : "text-zinc-700"
                    )}
                    onClick={() => setReviewRating(star)}
                    type="button"
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="min-h-[80px] resize-y rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5 text-[13px] text-foreground outline-none transition-colors focus:border-emerald-400"
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What do you think about this app? Write your review here..."
                value={reviewComment}
              />
              <div className="mt-1 flex justify-end gap-2">
                <button
                  className="rounded-2xl bg-white/[0.08] px-5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-white/[0.08]"
                  onClick={() => setReviewModalApp(undefined)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
                  onClick={handleSubmitReview}
                  type="button"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Uninstall Confirm Modal */}
      <AnimatePresence>
        {uninstallConfirmApp && (
          <motion.button
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] flex h-full w-full items-center justify-center bg-black/55 backdrop-blur-md"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setUninstallConfirmApp(undefined)}
            transition={{ duration: 0.2 }}
            type="button"
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex w-[92%] max-w-[440px] flex-col gap-3.5 rounded-3xl border border-white/14 bg-[rgba(30,30,30,0.96)] p-7 shadow-2xl shadow-black/70"
              initial={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.25 }}
            >
              <button
                className="absolute right-4 top-4 text-muted-foreground transition-all hover:text-foreground hover:scale-110"
                onClick={() => setUninstallConfirmApp(undefined)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-lg font-bold tracking-tight">
                Uninstall {uninstallConfirmApp.name}?
              </div>
              <div className="text-[13px] leading-relaxed text-foreground/80">
                This app and all associated temporary files will be removed from
                your system.
              </div>
              <div className="mt-1 flex justify-end gap-2">
                <button
                  className="rounded-2xl bg-white/[0.08] px-5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-white/[0.08]"
                  onClick={() => setUninstallConfirmApp(undefined)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-2xl bg-red-500 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-red-400"
                  onClick={handleConfirmUninstall}
                  type="button"
                >
                  Uninstall
                </button>
              </div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(AppStore);

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getFirebase } from "lib/firebase";
import {
  type AppCategory,
  type AppReview,
  type AppStoreApp,
  type SystemRequirements,
} from "components/apps/AppStore/mockData";

const APPS_COLLECTION = "appstore_apps";
const REVIEWS_COLLECTION = "appstore_reviews";

export type ListAppsResult = {
  apps: AppStoreApp[];
  error?: string;
};

export type DownloadAppResult = {
  blob?: Blob;
  error?: string;
  success: boolean;
};

const mapDocToApp = (data: Record<string, unknown>): AppStoreApp => ({
  ageRating: (data.ageRating as string) || undefined,
  badges: Array.isArray(data.badges) ? (data.badges as string[]) : undefined,
  category: (data.category as AppCategory) || "Utilities",
  changelog: (data.changelog as string) || undefined,
  description: (data.description as string) || "",
  developer: (data.developer as string) || "Unknown",
  downloadUrl: (data.downloadUrl as string) || "",
  heroImage: (data.heroImage as string) || undefined,
  iconUrl: (data.iconUrl as string) || "",
  id: (data.id as string) || "",
  isDiscoverMore: Boolean(data.isDiscoverMore),
  isFeaturedGrid: Boolean(data.isFeaturedGrid),
  isHero: Boolean(data.isHero),
  isTrendingApp: Boolean(data.isTrendingApp),
  isTrendingGame: Boolean(data.isTrendingGame),
  name: (data.name as string) || "Unknown",
  price: typeof data.price === "number" ? data.price : 0,
  rating: typeof data.rating === "number" ? data.rating : undefined,
  ratingCount: typeof data.ratingCount === "number" ? data.ratingCount : undefined,
  screenshots: Array.isArray(data.screenshots)
    ? (data.screenshots as string[])
    : undefined,
  size: (data.size as string) || undefined,
  sysReqs: data.sysReqs as SystemRequirements | undefined,
  tagline: (data.tagline as string) || undefined,
  version: (data.version as string) || "1.0.0",
});

export const listApps = async (category?: string): Promise<ListAppsResult> => {
  try {
    const { db } = getFirebase();
    const q =
      category && category !== "All"
        ? query(collection(db, APPS_COLLECTION), where("category", "==", category))
        : query(collection(db, APPS_COLLECTION));

    const snapshot = await getDocs(q);

    if (snapshot.empty) return { apps: [] };

    const apps = snapshot.docs.map((d) => mapDocToApp(d.data() as Record<string, unknown>));

    return { apps };
  } catch {
    return { apps: [] };
  }
};

export const listAllApps = async (): Promise<AppStoreApp[]> => {
  try {
    const { db } = getFirebase();
    const snapshot = await getDocs(collection(db, APPS_COLLECTION));

    if (snapshot.empty) return [];

    return snapshot.docs.map((d) =>
      mapDocToApp(d.data() as Record<string, unknown>)
    );
  } catch {
    return [];
  }
};

export const getAppReviews = async (appId: string): Promise<AppReview[]> => {
  try {
    const { db } = getFirebase();
    const snapshot = await getDocs(
      query(collection(db, REVIEWS_COLLECTION), where("appId", "==", appId))
    );

    if (snapshot.empty) return [];

    return snapshot.docs.map((d) => d.data() as AppReview);
  } catch {
    return [];
  }
};

export const submitAppReview = async (
  appId: string,
  review: AppReview
): Promise<boolean> => {
  try {
    const { db } = getFirebase();
    await setDoc(doc(db, REVIEWS_COLLECTION, review.id), {
      ...review,
      appId,
      createdAtServer: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
};

export const downloadApp = async (
  appId: string,
  apps?: AppStoreApp[]
): Promise<DownloadAppResult> => {
  const appList = apps ?? [];
  const app = appList.find((a) => a.id === appId);

  if (!app) {
    return { error: "App not found", success: false };
  }

  if (!app.downloadUrl) {
    return { error: "Demo — app not yet available", success: false };
  }

  try {
    const response = await fetch(app.downloadUrl);

    if (!response.ok) {
      return { error: "Download failed", success: false };
    }

    const blob = await response.blob();

    return { blob, success: true };
  } catch {
    return { error: "Download failed", success: false };
  }
};


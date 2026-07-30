import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebase } from "lib/firebase";

export type AccountProfile = {
  balance: number;
  country: string;
  createdAt: string;
  email: string;
  isDeveloper: boolean;
  username: string;
};

export type AccountDocument = AccountProfile & {
  purchasedAppIds: string[];
};

const USERS_COLLECTION = "users";

export const DEFAULT_BALANCE = 0;

export const detectCountry = (): string => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || "";
    const region = locale.split("-")[1];

    if (region) return region.toUpperCase();
  } catch {
    // Ignore detection failure
  }

  return "Unknown";
};

const accountRef = (uid: string): ReturnType<typeof doc> =>
  doc(getFirebase().db, USERS_COLLECTION, uid);

export const createAccountProfile = async (
  uid: string,
  data: {
    country: string;
    email: string;
    isDeveloper?: boolean;
    username: string;
  }
): Promise<AccountDocument> => {
  const profile: AccountDocument = {
    balance: DEFAULT_BALANCE,
    country: data.country,
    createdAt: new Date().toISOString(),
    email: data.email,
    isDeveloper: Boolean(data.isDeveloper),
    purchasedAppIds: [],
    username: data.username,
  };

  await setDoc(accountRef(uid), {
    ...profile,
    createdAtServer: serverTimestamp(),
  });

  return profile;
};

export const getAccountProfile = async (
  uid: string
): Promise<AccountDocument | undefined> => {
  const snapshot = await getDoc(accountRef(uid));

  if (!snapshot.exists()) return undefined;

  const data = snapshot.data();

  return {
    balance: typeof data.balance === "number" ? data.balance : DEFAULT_BALANCE,
    country: (data.country as string) || "Unknown",
    createdAt: (data.createdAt as string) || "",
    email: (data.email as string) || "",
    isDeveloper: Boolean(data.isDeveloper),
    purchasedAppIds: Array.isArray(data.purchasedAppIds)
      ? (data.purchasedAppIds as string[])
      : [],
    username: (data.username as string) || "",
  };
};

export const getOrCreateAccountProfile = async (
  uid: string,
  fallback: {
    country: string;
    email: string;
    username: string;
  }
): Promise<AccountDocument> => {
  const existing = await getAccountProfile(uid);

  if (existing) return existing;

  return createAccountProfile(uid, fallback);
};

export const writeAccountBalance = async (
  uid: string,
  balance: number
): Promise<void> => {
  await updateDoc(accountRef(uid), { balance });
};

export const writePurchasedApps = async (
  uid: string,
  purchasedAppIds: string[]
): Promise<void> => {
  await updateDoc(accountRef(uid), { purchasedAppIds });
};

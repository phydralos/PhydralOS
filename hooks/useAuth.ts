/* eslint-disable unicorn/no-null */
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getFirebase } from "lib/firebase";
import {
  createAccountProfile,
  detectCountry,
  getAccountProfile,
  writeAccountBalance,
  writePurchasedApps,
  type AccountProfile,
} from "lib/account";

const FRIENDLY_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/internal-error": "Something went wrong. Please try again.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/invalid-verification-code": "The verification code is invalid.",
  "auth/missing-email": "Please enter an email address.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/operation-not-allowed": "This action is not available right now.",
  "auth/popup-closed-by-user": "The sign-in window was closed.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/wrong-password": "Incorrect password. Please try again.",
};

const getFriendlyError = (error: unknown): string => {
  if (error instanceof Error) {
    const code = (/\((.*)\)/.exec(error.message))?.[1] || "";
    if (code && FRIENDLY_ERRORS[code]) return FRIENDLY_ERRORS[code];
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

export type AuthUser = {
  account?: AccountProfile & { purchasedAppIds: string[] };
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
};

export type SignUpDetails = {
  country?: string;
  isDeveloper?: boolean;
  username: string;
};

export type AuthState = {
  addPurchasedApp: (appId: string, cost: number) => Promise<boolean>;
  clearError: () => void;
  error: string | null;
  initializing: boolean;
  resetPassword: (email: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    details: SignUpDetails
  ) => Promise<void>;
  updateBalance: (newBalance: number) => Promise<boolean>;
  user: AuthUser | null;
};

const mapUser = (
  user: User | null,
  account?: AuthUser["account"]
): AuthUser | null =>
  user
    ? {
        account,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      }
    : null;

const useAuth = (): AuthState => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let timeoutId = 0;

    try {
      const { auth } = getFirebase();

      unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          window.clearTimeout(timeoutId);

          if (!firebaseUser) {
            setUser(null);
            setInitializing(false);
            return;
          }

          getAccountProfile(firebaseUser.uid)
            .then((account) => {
              setUser(mapUser(firebaseUser, account));
              setInitializing(false);
            })
            .catch(() => {
              setUser(mapUser(firebaseUser));
              setInitializing(false);
            });
        },
        () => {
          window.clearTimeout(timeoutId);
          setUser(null);
          setInitializing(false);
        }
      );

      timeoutId = window.setTimeout(() => {
        setInitializing(false);
      }, 8000);
    } catch {
      setUser(null);
      setInitializing(false);
    }

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        setError(null);
        const { auth } = getFirebase();
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const account = await getAccountProfile(credential.user.uid);
        setUser(mapUser(credential.user, account));
        setInitializing(false);
      } catch (error_) {
        const message = getFriendlyError(error_);
        setError(message);
        throw error_;
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      details: SignUpDetails
    ): Promise<void> => {
      try {
        setError(null);
        const { auth } = getFirebase();
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (details.username) {
          await updateProfile(credential.user, {
            displayName: details.username,
          });
        }

        const account = await createAccountProfile(credential.user.uid, {
          country: details.country || detectCountry(),
          email,
          isDeveloper: details.isDeveloper,
          username: details.username,
        });

        setUser(mapUser(credential.user, account));
        setInitializing(false);
      } catch (error_) {
        const message = getFriendlyError(error_);
        setError(message);
        throw error_;
      }
    },
    []
  );

  const updateBalance = useCallback(
    async (newBalance: number): Promise<boolean> => {
      if (!user?.uid || !user.account) return false;

      try {
        await writeAccountBalance(user.uid, newBalance);
        setUser((current) =>
          current?.account
            ? {
                ...current,
                account: { ...current.account, balance: newBalance },
              }
            : current
        );
        return true;
      } catch {
        return false;
      }
    },
    [user]
  );

  const addPurchasedApp = useCallback(
    async (appId: string, cost: number): Promise<boolean> => {
      if (!user?.uid || !user.account) return false;
      if (user.account.purchasedAppIds.includes(appId)) return true;
      if (user.account.balance < cost) return false;

      const newBalance = user.account.balance - cost;
      const newPurchased = [...user.account.purchasedAppIds, appId];

      try {
        await writeAccountBalance(user.uid, newBalance);
        await writePurchasedApps(user.uid, newPurchased);
        setUser((current) =>
          current?.account
            ? {
                ...current,
                account: {
                  ...current.account,
                  balance: newBalance,
                  purchasedAppIds: newPurchased,
                },
              }
            : current
        );
        return true;
      } catch {
        return false;
      }
    },
    [user]
  );

  const signOutUser = useCallback(async (): Promise<void> => {
    try {
      const { auth } = getFirebase();
      await signOut(auth);
    } catch (error_) {
      const message = getFriendlyError(error_);
      setError(message);
      throw error_;
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setError(null);
      const { auth } = getFirebase();
      await sendPasswordResetEmail(auth, email);
    } catch (error_) {
      const message = getFriendlyError(error_);
      setError(message);
      throw error_;
    }
  }, []);

  const clearError = useCallback((): void => setError(null), []);

  return useMemo(
    () => ({
      addPurchasedApp,
      clearError,
      error,
      initializing,
      resetPassword,
      signIn,
      signOutUser,
      signUp,
      updateBalance,
      user,
    }),
    [
      addPurchasedApp,
      clearError,
      error,
      initializing,
      resetPassword,
      signIn,
      signOutUser,
      signUp,
      updateBalance,
      user,
    ]
  );
};

export default useAuth;

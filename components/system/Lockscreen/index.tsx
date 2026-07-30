import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
} from "react";
import { useSession } from "contexts/session";
import { useAuthContext } from "contexts/auth";
import { StyledLockscreen } from "components/system/Lockscreen/StyledLockscreen";
import { detectCountry } from "lib/account";

const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/;

type LockscreenProps = {
  lockOnly?: boolean;
};

const UserIcon = (): React.JSX.Element => (
  <svg fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" fill="rgb(255 255 255 / 8%)" r="31" stroke="rgb(255 255 255 / 20%)" strokeWidth="1" />
    <circle cx="32" cy="24" fill="rgb(255 255 255 / 90%)" r="9" />
    <path
      d="M14 52c0-9.94 8.06-18 18-18s18 8.06 18 18"
      fill="rgb(255 255 255 / 90%)"
    />
  </svg>
);

const Lockscreen: FC<LockscreenProps> = ({ lockOnly = false }) => {
  const { isLocked, authUser } = useSession();
  const { signIn, signUp, error: authError, clearError, initializing } =
    useAuthContext();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [isDevAccount, setIsDevAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (authUser?.email) {
      setEmailInput(authUser.email);
    }
  }, [authUser]);

  useEffect(() => {
    if (isLocked) {
      setPasswordInput("");
      setErrorMessage("");
    }
  }, [isLocked]);

  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
  }, [authError]);

  useEffect(() => {
    const lockscreenElement = rootRef.current;
    const parent = lockscreenElement?.parentElement;
    const siblings =
      isLocked && parent
        ? ([...parent.children].filter(
            (child) => child !== lockscreenElement
          ) as HTMLElement[])
        : [];

    siblings.forEach((sibling) => sibling.setAttribute("inert", ""));

    return () => {
      siblings.forEach((sibling) => sibling.removeAttribute("inert"));
    };
  }, [isLocked]);

  useEffect(() => {
    let interval = 0;

    if (isLocked) {
      const updateDateTime = (): void => {
        const now = new Date();
        setTimeString(
          now.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
        );
        setDateString(
          now.toLocaleDateString([], {
            day: "numeric",
            month: "long",
            weekday: "long",
          })
        );
      };

      updateDateTime();
      interval = window.setInterval(updateDateTime, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isLocked]);

  const triggerShake = useCallback((): void => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      const cleanEmail = emailInput.trim();

      if (mode === "signup" && !usernameInput.trim()) {
        setErrorMessage("Please choose a username");
        triggerShake();
        return;
      }

      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        setErrorMessage("Please enter a valid email address");
        triggerShake();
        return;
      }

      if (mode !== "reset" && !passwordInput.trim()) {
        setErrorMessage("Please enter your password");
        triggerShake();
        return;
      }

      setLoading(true);
      setErrorMessage("");
      clearError();

      try {
        await (mode === "signup"
          ? signUp(cleanEmail, passwordInput, {
              country: detectCountry(),
              isDeveloper: isDevAccount,
              username: usernameInput.trim(),
            })
          : signIn(cleanEmail, passwordInput));
        setPasswordInput("");
      } catch (error_) {
        const message =
          error_ instanceof Error ? error_.message : "Authentication failed";
        setErrorMessage(message);
        triggerShake();
      } finally {
        setLoading(false);
      }
    },
    [
      clearError,
      emailInput,
      isDevAccount,
      mode,
      passwordInput,
      signIn,
      signUp,
      triggerShake,
      usernameInput,
    ]
  );

  // eslint-disable-next-line unicorn/no-null
  if (!isLocked || initializing) return null;

  const displayName =
    authUser?.account?.username ||
    authUser?.displayName ||
    (authUser?.email ? authUser.email.split("@")[0] : "Welcome back");

  return (
    <StyledLockscreen ref={rootRef} $shaking={shaking}>
      <div className="clock-container">
        <div className="time">{timeString}</div>
        <div className="date">{dateString}</div>
      </div>

      <div className="login-card">
        <div className="avatar-wrapper">
          {authUser?.photoURL ? (
            <img alt="User Avatar" src={authUser.photoURL} />
          ) : (
            <UserIcon />
          )}
        </div>

        <div className="user-name">{displayName}</div>
        <div className="user-subtitle">
          {mode === "signup" ? "Create your account" : "Sign in to continue"}
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="spinner" />
            <div className="loading-text">
              {mode === "signup" ? "Creating account..." : "Signing in..."}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="input-wrapper">
                <input
                  autoComplete="username"
                  disabled={loading}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Username"
                  type="text"
                  value={usernameInput}
                  autoFocus
                />
              </div>
            )}

            <div className="input-wrapper">
              <input
                autoComplete="email"
                autoFocus={mode !== "signup"}
                disabled={loading || lockOnly}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email address"
                type="email"
                value={emailInput}
              />
            </div>

            <div className="input-wrapper">
              <input
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                disabled={loading}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                type="password"
                value={passwordInput}
              />
              <button
                disabled={loading}
                title={mode === "signup" ? "Create Account" : "Sign In"}
                type="submit"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {mode === "signup" && (
              <label
                style={{
                  alignItems: "center",
                  color: "rgb(255 255 255 / 70%)",
                  cursor: "pointer",
                  display: "flex",
                  fontSize: "12px",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <input
                  checked={isDevAccount}
                  disabled={loading}
                  onChange={(e) => setIsDevAccount(e.target.checked)}
                  type="checkbox"
                />
                Register as a developer account
              </label>
            )}
          </form>
        )}

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {!loading && (
          <div className="auth-modes">
          {mode !== "signin" && (
            <button
              onClick={() => {
                setMode("signin");
                setErrorMessage("");
                clearError();
              }}
              type="button"
            >
              Sign in
            </button>
          )}
          {mode !== "signup" && (
            <button
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
                clearError();
              }}
              type="button"
            >
              Create account
            </button>
          )}
        </div>
        )}
      </div>
    </StyledLockscreen>
  );
};

export default memo(Lockscreen);

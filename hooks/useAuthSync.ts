import { useEffect, useRef } from "react";
import { useAuthContext } from "contexts/auth";
import { useSession } from "contexts/session";

const useAuthSync = (): void => {
  const { user, initializing } = useAuthContext();
  const { setIsLocked, setAuthUser, setUserEmail } = useSession();
  const initialized = useRef(false);

  useEffect(() => {
    if (initializing) return;

    setAuthUser(user);

    if (user) {
      if (user.email) setUserEmail(user.email);
      setIsLocked(false);
    } else if (initialized.current) {
      setIsLocked(true);
    }

    initialized.current = true;
  }, [initializing, setAuthUser, setIsLocked, setUserEmail, user]);
};

export default useAuthSync;

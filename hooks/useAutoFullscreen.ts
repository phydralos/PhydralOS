import { useCallback, useEffect } from "react";

const isMobile = (): boolean =>
  typeof window !== "undefined" &&
  (navigator.userAgent.includes("Mobile") ||
    navigator.userAgent.includes("Android") ||
    navigator.userAgent.includes("iPhone") ||
    window.innerWidth <= 768);

const requestFullscreen = async (
  element: HTMLElement | null
): Promise<void> => {
  if (!element) return;

  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    }).webkitRequestFullscreen) {
      await (
        element as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
        }
      ).webkitRequestFullscreen?.();
    } else if ((element as HTMLElement & {
      msRequestFullscreen?: () => Promise<void>;
    }).msRequestFullscreen) {
      await (
        element as HTMLElement & {
          msRequestFullscreen?: () => Promise<void>;
        }
      ).msRequestFullscreen?.();
    }
  } catch {
    // Fullscreen may be blocked by browser — ignore silently
  }
};

const lockOrientation = async (): Promise<void> => {
  try {
    const screen = window.screen as Screen & {
      orientation?: { lock?: (o: string) => Promise<void> };
    };
    if (screen.orientation?.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch {
    // Orientation lock may not be supported — ignore
  }
};

const useAutoFullscreen = (enabled: boolean): void => {
  const enterFullscreen = useCallback(async (): Promise<void> => {
    if (typeof document === "undefined") return;

    const isAlreadyFullscreen = Boolean(
      document.fullscreenElement ||
        (document as Document & {
          webkitFullscreenElement?: Element;
        }).webkitFullscreenElement
    );

    if (isAlreadyFullscreen) return;

    await requestFullscreen(document.documentElement);

    if (isMobile()) {
      await lockOrientation();
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    enterFullscreen();

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        enterFullscreen();
      }
    };

    const handleUserGesture = (): void => {
      enterFullscreen();
      document.removeEventListener("click", handleUserGesture);
      document.removeEventListener("touchend", handleUserGesture);
      document.removeEventListener("keydown", handleUserGesture);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!document.fullscreenElement) {
      document.addEventListener("click", handleUserGesture, { once: true });
      document.addEventListener("touchend", handleUserGesture, {
        once: true,
      });
      document.addEventListener("keydown", handleUserGesture, { once: true });
    }

    // eslint-disable-next-line consistent-return
    return (): void => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleUserGesture);
      document.removeEventListener("touchend", handleUserGesture);
      document.removeEventListener("keydown", handleUserGesture);
    };
  }, [enabled, enterFullscreen]);
};

export default useAutoFullscreen;

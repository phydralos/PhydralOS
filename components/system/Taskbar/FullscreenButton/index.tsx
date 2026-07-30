import { memo, useCallback, useEffect, useState } from "react";
import { useTheme } from "styled-components";
import StyledFullscreenButton from "components/system/Taskbar/FullscreenButton/StyledFullscreenButton";
import { DIV_BUTTON_PROPS } from "utils/constants";
import { label } from "utils/functions";

const FullscreenIcon = memo(({ isFullscreen }: { isFullscreen: boolean }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    {isFullscreen ? (
      <path
        d="M9 9H5V5h4v4zm10 0h-4V5h4v4zM9 19H5v-4h4v4zm10 0h-4v-4h4v4z"
        fill="#fff"
      />
    ) : (
      <path
        d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v6h-6v-2h4v-4z"
        fill="#fff"
      />
    )}
  </svg>
));

const FullscreenButton: FC = () => {
  const {
    sizes: { taskbar },
  } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = (): void =>
      setIsFullscreen(
        Boolean(
          document.fullscreenElement ||
            (document as Document & {
              webkitFullscreenElement?: Element;
            }).webkitFullscreenElement
        )
      );
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async (): Promise<void> => {
    try {
      if (document.fullscreenElement) {
        const exitPromise =
          document.exitFullscreen?.() ??
          (document as Document & {
            webkitExitFullscreen?: () => Promise<void>;
          }).webkitExitFullscreen?.();
        await exitPromise;
      } else {
        const el = document.documentElement as HTMLElement & {
          msRequestFullscreen?: () => Promise<void>;
          webkitRequestFullscreen?: () => Promise<void>;
        };
        const enterPromise =
          el.requestFullscreen?.() ??
          el.webkitRequestFullscreen?.() ??
          el.msRequestFullscreen?.();
        await enterPromise;
      }
    } catch {
      // Fullscreen may be blocked — ignore silently
    }
  }, []);

  return (
    <StyledFullscreenButton
      $active={isFullscreen}
      $left={taskbar.button.width * 2}
      onClick={toggleFullscreen}
      {...DIV_BUTTON_PROPS}
      {...label(isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen")}
    >
      <FullscreenIcon isFullscreen={isFullscreen} />
    </StyledFullscreenButton>
  );
};

export default memo(FullscreenButton);

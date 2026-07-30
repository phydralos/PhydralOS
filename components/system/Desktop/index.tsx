import { memo, useRef, type FC, type PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import StyledDesktop from "components/system/Desktop/StyledDesktop";
import useWallpaper from "components/system/Desktop/Wallpapers/useWallpaper";
import FileManager from "components/system/Files/FileManager";
import { useSession } from "contexts/session";
import { DESKTOP_PATH } from "utils/constants";

const Widgets = dynamic(() => import("components/system/Desktop/Widgets"));

const Desktop: FC<PropsWithChildren> = ({ children }) => {
  const desktopRef = useRef<HTMLElement | null>(null);
  const { widgetsEnabled } = useSession();

  useWallpaper(desktopRef);

  return (
    <StyledDesktop ref={desktopRef}>
      <FileManager
        url={DESKTOP_PATH}
        allowMovingDraggableEntries
        hideLoading
        hideScrolling
        isDesktop
        loadIconsImmediately
      />
      {widgetsEnabled && <Widgets />}
      {children}
    </StyledDesktop>
  );
};

export default memo(Desktop);

import { useTheme } from "styled-components";
import { useCallback, useEffect, useRef } from "react";
import { bgPositionSize } from "components/system/Desktop/Wallpapers/constants";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import { DEFAULT_WALLPAPER, NATIVE_IMAGE_FORMATS } from "utils/constants";
import { bufferToUrl, getExtension, isBeforeBg } from "utils/functions";

const useWallpaper = (
  desktopRef: React.RefObject<HTMLElement | null>
): void => {
  const { exists, readFile } = useFileSystem();
  const { sessionLoaded, wallpaperImage, wallpaperFit } = useSession();
  const { colors } = useTheme();
  const loadedRef = useRef(false);

  const loadStaticWallpaper = useCallback(async () => {
    if (!desktopRef.current || loadedRef.current) return;

    const wallpaperPath = wallpaperImage || DEFAULT_WALLPAPER;

    if (!(await exists(wallpaperPath))) return;

    const imgExt = getExtension(wallpaperPath);
    const isNative = NATIVE_IMAGE_FORMATS.has(imgExt);
    const [initialData, decoder] = await Promise.all([
      readFile(wallpaperPath),
      isNative
        ? Promise.resolve()
        : import("utils/imageDecoder").then((m) => m.decodeImageToBuffer),
    ]);
    let fileData = initialData;

    if (!isNative && decoder) {
      const decodedData = await decoder(imgExt, fileData);

      if (decodedData) fileData = decodedData;
    }

    const wallpaperUrl = bufferToUrl(fileData);
    const positionSize = bgPositionSize[wallpaperFit];
    const isAfterNextBackground = isBeforeBg();

    document.documentElement.style.setProperty(
      `--${isAfterNextBackground ? "after" : "before"}-background`,
      `url(${CSS.escape(wallpaperUrl)}) ${positionSize} no-repeat fixed border-box border-box ${colors.background}`
    );
    document.documentElement.style.setProperty(
      "--after-background-opacity",
      isAfterNextBackground ? "1" : "0"
    );
    document.documentElement.style.setProperty(
      "--before-background-opacity",
      isAfterNextBackground ? "0" : "1"
    );

    loadedRef.current = true;
  }, [colors, desktopRef, exists, readFile, wallpaperFit, wallpaperImage]);

  useEffect(() => {
    if (sessionLoaded) {
      loadStaticWallpaper();
    }
  }, [loadStaticWallpaper, sessionLoaded]);
};

export default useWallpaper;

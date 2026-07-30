import { memo, useEffect, useState } from "react";
import AppsLoader from "components/system/Apps/AppsLoader";
import BootScreen, { hasBooted } from "components/system/BootScreen";
import Desktop from "components/system/Desktop";
import Lockscreen from "components/system/Lockscreen";
import Taskbar from "components/system/Taskbar";
import ToastNotifications from "components/system/Notifications";
import useAuthSync from "hooks/useAuthSync";
import useAutoFullscreen from "hooks/useAutoFullscreen";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";
import useUrlLoader from "hooks/useUrlLoader";

const Index = (): React.ReactElement => {
  const [booted, setBooted] = useState<boolean>();
  useAuthSync();
  useAutoFullscreen(Boolean(booted));
  useIFrameFocuser();
  useUrlLoader();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();

  useEffect(() => {
    setBooted(hasBooted());
  }, []);

  if (!booted) {
    return (
      <BootScreen onComplete={() => setBooted(true)} />
    );
  }

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
      <ToastNotifications />
      <Lockscreen />
    </Desktop>
  );
};

export default memo(Index);

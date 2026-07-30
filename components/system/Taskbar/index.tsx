import { memo, useCallback, useEffect, useState, type FC } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import {
  importAIButton,
  importAIChat,
  importCalendar,
  importSearch,
  importStartMenu,
} from "components/system/Taskbar/functions";
import Clock from "components/system/Taskbar/Clock";
import FullscreenButton from "components/system/Taskbar/FullscreenButton";
import SearchButton from "components/system/Taskbar/Search/SearchButton";
import StartButton from "components/system/Taskbar/StartButton";
import StyledTaskbar from "components/system/Taskbar/StyledTaskbar";
import SystemTray from "components/system/Taskbar/SystemTray";
import TaskbarEntries from "components/system/Taskbar/TaskbarEntries";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { clearBootCache } from "components/system/BootScreen";
import ShutdownScreen from "components/system/BootScreen/ShutdownScreen";
import SystemPrompt from "components/system/StartMenu/Sidebar/SystemPrompt";
import { useAuthContext } from "contexts/auth";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import { CLOCK_CANVAS_BASE_WIDTH, FOCUSABLE_ELEMENT } from "utils/constants";
import { useWindowAI } from "hooks/useWindowAI";

const AIButton = dynamic(importAIButton);
const AIChat = dynamic(importAIChat);
const Calendar = dynamic(importCalendar);
const Search = dynamic(importSearch);
const StartMenu = dynamic(importStartMenu);

const Taskbar: FC = () => {
  const [startMenuVisible, setStartMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [aiVisible, setAIVisible] = useState(false);
  const [clockWidth, setClockWidth] = useState(CLOCK_CANVAS_BASE_WIDTH);
  const [promptVisible, setPromptVisible] = useState(false);
  const [shutdownAction, setShutdownAction] = useState<"power" | undefined>();
  const { aiEnabled, setHaltSession } = useSession();
  const { rootFs } = useFileSystem();
  const { signOutUser } = useAuthContext();
  const hasWindowAI = useWindowAI();
  const toggleStartMenu = useCallback(
    (showMenu?: boolean): void =>
      setStartMenuVisible((currentMenuState) => showMenu ?? !currentMenuState),
    []
  );
  const toggleSearch = useCallback(
    (showSearch?: boolean): void =>
      setSearchVisible(
        (currentSearchState) => showSearch ?? !currentSearchState
      ),
    []
  );
  const toggleCalendar = useCallback(
    (showCalendar?: boolean): void =>
      setCalendarVisible(
        (currentCalendarState) => showCalendar ?? !currentCalendarState
      ),
    []
  );
  const toggleAI = useCallback(
    (showAI?: boolean): void =>
      setAIVisible((currentAIState) => showAI ?? !currentAIState),
    []
  );
  const hasAI = hasWindowAI || aiEnabled;

  useEffect(() => {
    const handler = (): void => {
      setStartMenuVisible(false);
      setPromptVisible(true);
    };

    window.addEventListener("pyhdra-prompt-action", handler);

    return () => window.removeEventListener("pyhdra-prompt-action", handler);
  }, []);

  return (
    <>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {startMenuVisible && (
          <StartMenu
            key="startMenu"
            toggleStartMenu={toggleStartMenu}
          />
        )}
        {searchVisible && <Search key="search" toggleSearch={toggleSearch} />}
      </AnimatePresence>
      <StyledTaskbar {...useTaskbarContextMenu()} {...FOCUSABLE_ELEMENT}>
        <StartButton
          startMenuVisible={startMenuVisible}
          toggleStartMenu={toggleStartMenu}
        />
        <SearchButton
          searchVisible={searchVisible}
          toggleSearch={toggleSearch}
        />
        <FullscreenButton />
        <TaskbarEntries clockWidth={clockWidth} hasAI={hasAI} />
        <SystemTray />
        <Clock
          hasAI={hasAI}
          setClockWidth={setClockWidth}
          toggleCalendar={toggleCalendar}
          width={clockWidth}
        />
        {hasAI && <AIButton aiVisible={aiVisible} toggleAI={toggleAI} />}
      </StyledTaskbar>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {calendarVisible && (
          <Calendar key="calendar" toggleCalendar={toggleCalendar} />
        )}
        {aiVisible && <AIChat key="aiChat" toggleAI={toggleAI} />}
      </AnimatePresence>
      {promptVisible &&
        typeof document !== "undefined" &&
        createPortal(
          <SystemPrompt
            onCancel={() => setPromptVisible(false)}
            onConfirm={() => {
              setPromptVisible(false);
              setShutdownAction("power");
            }}
          />,
          document.body
        )}
      {shutdownAction &&
        typeof document !== "undefined" &&
        createPortal(
          <ShutdownScreen
            action={shutdownAction}
            onComplete={() => {
              const blackOverlay = document.createElement("div");
              blackOverlay.style.cssText =
                "position:fixed;inset:0;background:#0a0a0f;z-index:3000000;";
              document.body.append(blackOverlay);
              setHaltSession(true);
              clearBootCache();

              signOutUser().finally(() => {
                import("contexts/fileSystem/functions").then(({ resetStorage }) =>
                  resetStorage(rootFs).finally(() => window.location.reload())
                );
              });
            }}
          />,
          document.body
        )}
    </>
  );
};

export default memo(Taskbar);

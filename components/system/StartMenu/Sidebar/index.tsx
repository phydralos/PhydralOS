import { useTheme } from "styled-components";
import { memo, useEffect, useMemo, useRef, useState, type FC } from "react";
import SidebarButton, {
  type SidebarButtons,
} from "components/system/StartMenu/Sidebar/SidebarButton";
import {
  AllApps,
  Documents,
  Pictures,
  Power,
  SideMenu,
  Videos,
} from "components/system/StartMenu/Sidebar/SidebarIcons";
import StyledSidebar from "components/system/StartMenu/Sidebar/StyledSidebar";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { HOME, TASKBAR_HEIGHT } from "utils/constants";
import { haltEvent, viewHeight } from "utils/functions";

type SidebarGroupProps = {
  sidebarButtons: SidebarButtons;
};

const SidebarGroup: FC<SidebarGroupProps> = ({ sidebarButtons }) => (
  <ol>
    {sidebarButtons.map((button) => (
      <SidebarButton key={button.name} {...button} />
    ))}
  </ol>
);

type SidebarProps = {
  height?: string;
};

const Sidebar: FC<SidebarProps> = ({ height }) => {
  const { open } = useProcesses();
  const { authUser } = useSession();
  const [collapsed, setCollapsed] = useState(true);
  const expandTimer = useRef(0);
  const sidebarRef = useRef<HTMLElement>(null);
  const clearTimer = (): void => {
    if (expandTimer.current) {
      clearTimeout(expandTimer.current);
      expandTimer.current = 0;
    }
  };
  const topButtons: SidebarButtons = useMemo(
    () => [
      {
        heading: true,
        icon: <SideMenu />,
        name: "START",
        ...(collapsed && { tooltip: "Expand" }),
      },
      {
        active: true,
        icon: <AllApps />,
        name: "All apps",
        ...(collapsed && { tooltip: "All apps" }),
      },
    ],
    [collapsed]
  );
  const { sizes } = useTheme();
  const vh = viewHeight();
  const buttonAreaCount = useMemo(
    () => Math.floor((vh - TASKBAR_HEIGHT) / sizes.startMenu.sideBar.width),
    [sizes.startMenu.sideBar.width, vh]
  );
  const bottomButtons = useMemo(
    () =>
      [
        buttonAreaCount > 3
          ? {
              action: () =>
                open(
                  "FileExplorer",
                  { url: `${HOME}/Documents` },
                  "/System/Icons/documents.webp"
                ),
              icon: <Documents />,
              name: "Documents",
              ...(collapsed && { tooltip: "Documents" }),
            }
          : undefined,
        buttonAreaCount > 4
          ? {
              action: () =>
                open(
                  "FileExplorer",
                  { url: `${HOME}/Pictures` },
                  "/System/Icons/pictures.webp"
                ),
              icon: <Pictures />,
              name: "Pictures",
              ...(collapsed && { tooltip: "Pictures" }),
            }
          : undefined,
        buttonAreaCount > 5
          ? {
              action: () =>
                open(
                  "FileExplorer",
                  { url: `${HOME}/Videos` },
                  "/System/Icons/videos.webp"
                ),
              icon: <Videos />,
              name: "Videos",
              ...(collapsed && { tooltip: "Videos" }),
            }
          : undefined,
        {
          icon: <Power />,
          name: "Restart OS",
          tooltip: "Clears session data and reloads the page.",
        },
      ].filter(Boolean) as SidebarButtons,
    [buttonAreaCount, collapsed, open]
  );

  useEffect(() => clearTimer, []);

  return (
    <StyledSidebar
      ref={sidebarRef}
      className={collapsed ? "collapsed" : undefined}
      onClick={({ target }) => {
        clearTimer();

        if (
          target instanceof HTMLElement &&
          ((target === sidebarRef.current && collapsed) ||
            (sidebarRef.current?.contains(target) &&
              target.textContent === "START"))
        ) {
          setCollapsed((collapsedState) => !collapsedState);
        }
      }}
      onContextMenu={haltEvent}
      onMouseDown={({ target }) => {
        if (!(target instanceof HTMLElement)) return;
        const li = target.closest("li");
        if (!li) return;
        if (li.textContent?.trim() === "Restart OS") {
          window.dispatchEvent(
            new CustomEvent("pyhdra-prompt-action", {
              detail: "power",
            })
          );
        }
      }}
      onMouseEnter={() => {
        expandTimer.current = window.setTimeout(() => setCollapsed(false), 700);
      }}
      onMouseLeave={() => {
        clearTimer();
        setCollapsed(true);
      }}
      style={{ height }}
    >
      <SidebarGroup sidebarButtons={topButtons} />
      <SidebarGroup sidebarButtons={bottomButtons} />
      {authUser && (
        <div className="profile-section">
          {authUser.photoURL ? (
            <img
              alt="Profile"
              className="profile-avatar"
              src={authUser.photoURL}
            />
          ) : (
            <svg className="profile-avatar" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" fill="rgb(255 255 255 / 10%)" r="24" />
              <circle cx="24" cy="18" fill="rgb(255 255 255 / 85%)" r="9" />
              <path
                d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16"
                fill="rgb(255 255 255 / 85%)"
              />
            </svg>
          )}
          {!collapsed && (
            <div className="profile-info">
              <div className="profile-name">
                {authUser.displayName ||
                  (authUser.email
                    ? authUser.email.split("@")[0]
                    : "User")}
              </div>
              <div className="profile-email">{authUser.email}</div>
            </div>
          )}
        </div>
      )}
    </StyledSidebar>
  );
};

export default memo(Sidebar);

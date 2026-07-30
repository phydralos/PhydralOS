import { memo, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m as motion } from "motion/react";
import StyledSystemTray, {
  StyledFlyoutItem,
  StyledFlyoutLabel,
  StyledFlyoutSeparator,
  StyledFlyoutValue,
  StyledTrayButton,
  StyledTrayFlyout,
  StyledTrayGroup,
} from "components/system/Taskbar/SystemTray/StyledSystemTray";
import {
  BatteryIcon,
  ChevronUpIcon,
  NetworkIcon,
  VolumeIcon,
} from "components/system/Taskbar/SystemTray/TrayIcons";
import { FOCUSABLE_ELEMENT } from "utils/constants";

type BatteryState = {
  charging: boolean;
  level: number;
  supported: boolean;
};

type NetworkState = {
  effectiveType: string;
  online: boolean;
};

const useBattery = (): BatteryState => {
  const [battery, setBattery] = useState<BatteryState>({
    charging: false,
    level: 100,
    supported: false,
  });

  useEffect(() => {
    let batteryManager: EventTarget | null = null;
    let cleanup: (() => void) | undefined;

    const setup = async (): Promise<void> => {
      try {
        if (!("getBattery" in navigator)) return;

        const manager = await (
          navigator as unknown as {
            getBattery: () => Promise<
              EventTarget & {
                charging: boolean;
                level: number;
                addEventListener: (type: string, cb: () => void) => void;
                removeEventListener: (type: string, cb: () => void) => void;
              }
            >;
          }
        ).getBattery();

        batteryManager = manager;

        const update = (): void =>
          setBattery({
            charging: manager.charging,
            level: Math.round(manager.level * 100),
            supported: true,
          });

        update();

        manager.addEventListener("chargingchange", update);
        manager.addEventListener("levelchange", update);

        cleanup = () => {
          manager.removeEventListener("chargingchange", update);
          manager.removeEventListener("levelchange", update);
        };
      } catch {
        // Battery API not available
      }
    };

    setup();

    return () => cleanup?.();
  }, []);

  return battery;
};

const useNetworkStatus = (): NetworkState => {
  const [network, setNetwork] = useState<NetworkState>({
    effectiveType: "4g",
    online: true,
  });

  useEffect(() => {
    const connection = (
      navigator as unknown as {
        connection?: { effectiveType: string };
      }
    ).connection;

    const update = (): void =>
      setNetwork({
        effectiveType: connection?.effectiveType || "4g",
        online: navigator.onLine,
      });

    update();

    window.addEventListener("online", update, { passive: true });
    window.addEventListener("offline", update, { passive: true });

    if (connection && "addEventListener" in connection) {
      (connection as unknown as EventTarget).addEventListener("change", update);
    }

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      if (connection && "removeEventListener" in connection) {
        (connection as unknown as EventTarget).removeEventListener("change", update);
      }
    };
  }, []);

  return network;
};

const SystemTray: FC = () => {
  const [flyoutVisible, setFlyoutVisible] = useState(false);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const battery = useBattery();
  const network = useNetworkStatus();
  const toggleFlyout = useCallback(
    () => setFlyoutVisible((current) => !current),
    []
  );

  useEffect(() => {
    if (!flyoutVisible) return undefined;

    const closeOnOutsideClick = ({ target }: MouseEvent): void => {
      if (
        trayRef.current &&
        target instanceof Node &&
        !trayRef.current.contains(target)
      ) {
        setFlyoutVisible(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick, {
      passive: true,
    });

    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [flyoutVisible]);

  return (
    <StyledSystemTray ref={trayRef} {...FOCUSABLE_ELEMENT}>
      <AnimatePresence initial={false}>
        {flyoutVisible && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            initial={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            <StyledTrayFlyout>
              <StyledFlyoutItem>
                <NetworkIcon size={14} />
                <StyledFlyoutLabel>Network</StyledFlyoutLabel>
                <StyledFlyoutValue>
                  {network.online ? network.effectiveType : "Offline"}
                </StyledFlyoutValue>
              </StyledFlyoutItem>
              <StyledFlyoutSeparator />
              <StyledFlyoutItem>
                <VolumeIcon size={14} />
                <StyledFlyoutLabel>Volume</StyledFlyoutLabel>
                <StyledFlyoutValue>100%</StyledFlyoutValue>
              </StyledFlyoutItem>
              {battery.supported && (
                <>
                  <StyledFlyoutSeparator />
                  <StyledFlyoutItem>
                    <BatteryIcon
                      charging={battery.charging}
                      level={battery.level}
                      size={14}
                    />
                    <StyledFlyoutLabel>Battery</StyledFlyoutLabel>
                    <StyledFlyoutValue>
                      {battery.level}%{battery.charging ? " (Charging)" : ""}
                    </StyledFlyoutValue>
                  </StyledFlyoutItem>
                </>
              )}
            </StyledTrayFlyout>
          </motion.div>
        )}
      </AnimatePresence>
      <StyledTrayGroup>
        <StyledTrayButton
          aria-label="System tray"
          onClick={toggleFlyout}
          title="System tray"
          type="button"
        >
          <ChevronUpIcon size={10} />
        </StyledTrayButton>
        <StyledTrayButton
          aria-label="Network"
          title={`Network: ${network.online ? network.effectiveType : "Offline"}`}
          type="button"
        >
          <NetworkIcon size={14} />
        </StyledTrayButton>
        {battery.supported && (
          <StyledTrayButton
            aria-label="Battery"
            title={`Battery: ${battery.level}%${battery.charging ? " (Charging)" : ""}`}
            type="button"
          >
            <BatteryIcon
              charging={battery.charging}
              level={battery.level}
              size={14}
            />
          </StyledTrayButton>
        )}
      </StyledTrayGroup>
    </StyledSystemTray>
  );
};

export default memo(SystemTray);
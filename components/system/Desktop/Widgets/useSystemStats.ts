import { useEffect, useRef, useState } from "react";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

type SystemStats = {
  cpuHistory: number[];
  cpuUsage: number;
  memoryTotal: number;
  memoryUsage: number;
  networkDownlink: number;
  networkType: string;
  uptime: string;
};

const HISTORY_LENGTH = 30;
const POLL_INTERVAL = 2000;

const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);

  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
};

const formatUptime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / MILLISECONDS_IN_SECOND);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;

  return `${minutes}m`;
};

const useSystemStats = (enabled: boolean): SystemStats => {
  const startTime = useRef(Date.now());
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const [stats, setStats] = useState<SystemStats>({
    cpuHistory: [],
    cpuUsage: 0,
    memoryTotal: 0,
    memoryUsage: 0,
    networkDownlink: 0,
    networkType: "unknown",
    uptime: "0m",
  });

  useEffect(() => {
    if (!enabled) return undefined;

    let rafId: number;
    let intervalId: number;

    const measureFps = (): void => {
      frameCountRef.current += 1;
      rafId = requestAnimationFrame(measureFps);
    };

    rafId = requestAnimationFrame(measureFps);

    const update = (): void => {
      const now = performance.now();
      const elapsed = now - lastFrameTimeRef.current;
      const fps =
        elapsed > 0 ? (frameCountRef.current / (elapsed / 1000)) : 0;
      const maxFps = 120;
      const cpuEstimate = Math.min(
        100,
        Math.round(100 - (fps / maxFps) * 100)
      );

      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;

      let memoryUsage = 0;
      let memoryTotal = 0;

      if (
        "memory" in performance &&
        typeof (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory ===
          "object"
      ) {
        const { usedJSHeapSize, jsHeapSizeLimit } = (
          performance as Performance & {
            memory: { usedJSHeapSize: number; jsHeapSizeLimit: number };
          }
        ).memory;

        memoryUsage = usedJSHeapSize;
        memoryTotal = jsHeapSizeLimit;
      }

      const connection = (
        navigator as unknown as {
          connection?: { downlink: number; effectiveType: string };
        }
      ).connection;

      setStats((current) => ({
        cpuHistory: [...current.cpuHistory, cpuEstimate].slice(-HISTORY_LENGTH),
        cpuUsage: cpuEstimate,
        memoryTotal,
        memoryUsage,
        networkDownlink: connection?.downlink || 0,
        networkType: connection?.effectiveType || "unknown",
        uptime: formatUptime(Date.now() - startTime.current),
      }));
    };

    update();
    intervalId = window.setInterval(update, POLL_INTERVAL);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(intervalId);
    };
  }, [enabled]);

  return stats;
};

export { formatBytes };

export default useSystemStats;
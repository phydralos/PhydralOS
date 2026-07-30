import { memo, useEffect, useRef, useState, type FC } from "react";
import StyledBootScreen from "components/system/BootScreen/StyledBootScreen";

const BOOT_CACHE_KEY = "pyhdra-os-booted";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

type BootLine = {
  delay?: number;
  text: string;
  type?: "dim" | "bright";
};

const BOOT_SEQUENCE: BootLine[] = [
  { delay: 0, text: "PYHDRAL OS v2.0.1", type: "bright" },
  { delay: 150, text: "Copyright (c) 2026 Pyhdral Systems.", type: "dim" },
  { delay: 200, text: "" },
  { delay: 200, text: "Loading kernel..." },
  { delay: 200, text: "Mounting file system..." },
  { delay: 200, text: "Detecting hardware..." },
  { delay: 200, text: "Starting services..." },
  { delay: 200, text: "Preloading apps..." },
  { delay: 200, text: "Establishing session..." },
  { delay: 200, text: "" },
  { delay: 300, text: "Boot complete.", type: "bright" },
];

export const clearBootCache = (): void => {
  try {
    localStorage.removeItem(BOOT_CACHE_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const hasBooted = (): boolean => {
  try {
    return localStorage.getItem(BOOT_CACHE_KEY) === "true";
  } catch {
    return false;
  }
};

type BootScreenProps = {
  onComplete?: () => void;
};

const BootScreen: FC<BootScreenProps> = ({ onComplete }) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [done, setDone] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!done || completedRef.current) return noop;
    completedRef.current = true;
    try {
      localStorage.setItem(BOOT_CACHE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
    const timer = window.setTimeout(() => onComplete?.(), 600);
    return () => window.clearTimeout(timer);
  }, [done, onComplete]);

  useEffect(() => {
    let lineIndex = 0;
    let timer = 0;

    const showNextLine = (): void => {
      if (lineIndex >= BOOT_SEQUENCE.length) {
        setDone(true);
        return;
      }

      const line = BOOT_SEQUENCE[lineIndex];
      setVisibleLines(lineIndex + 1);

      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }

      lineIndex += 1;
      timer = window.setTimeout(showNextLine, line.delay ?? 200);
    };

    timer = window.setTimeout(showNextLine, 300);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <StyledBootScreen>
      <div className="scanline" />
      <div ref={contentRef} className="boot-content">
        {BOOT_SEQUENCE.slice(0, visibleLines).map((line, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={`boot-line${line.type ? ` ${line.type}` : ""}`}
          >
            {line.text}
            {index === visibleLines - 1 && !done && (
              <span className="cursor">_</span>
            )}
          </div>
        ))}
      </div>
    </StyledBootScreen>
  );
};

export default memo(BootScreen);

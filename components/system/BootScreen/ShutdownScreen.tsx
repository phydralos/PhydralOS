import { memo, useEffect, useRef, useState, type FC } from "react";
import StyledShutdownScreen from "components/system/BootScreen/StyledShutdownScreen";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

type ShutdownLine = {
  delay: number;
  text: string;
  type?: "dim" | "bright";
};

const SHUTDOWN_SEQUENCE: ShutdownLine[] = [
  { delay: 0, text: "PYHDRAL OS v2.0.1", type: "bright" },
  { delay: 150, text: "Copyright (c) 2026 Pyhdral Systems.", type: "dim" },
  { delay: 200, text: "" },
  { delay: 200, text: "Stopping services..." },
  { delay: 200, text: "Unmounting file system..." },
  { delay: 200, text: "Releasing hardware..." },
  { delay: 200, text: "" },
  { delay: 300, text: "Power off.", type: "bright" },
];

const LOGOUT_SEQUENCE: ShutdownLine[] = [
  { delay: 0, text: "Logging out...", type: "bright" },
  { delay: 200, text: "Closing processes..." },
  { delay: 200, text: "" },
  { delay: 300, text: "Goodbye.", type: "bright" },
];

type ShutdownScreenProps = {
  action: "power" | "logout";
  onComplete?: () => void;
};

const ShutdownScreen: FC<ShutdownScreenProps> = ({ action, onComplete }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);
  const [blacked, setBlacked] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef(false);
  const sequence = action === "power" ? SHUTDOWN_SEQUENCE : LOGOUT_SEQUENCE;

  useEffect(() => {
    if (!done || completedRef.current) return noop;
    completedRef.current = true;
    const blackTimer = window.setTimeout(() => setBlacked(true), 800);
    return () => window.clearTimeout(blackTimer);
  }, [done]);

  useEffect(() => {
    if (!blacked) return noop;
    const completeTimer = window.setTimeout(() => onComplete?.(), 1200);
    return () => window.clearTimeout(completeTimer);
  }, [blacked, onComplete]);

  useEffect(() => {
    let lineIndex = 0;
    let timer = 0;

    const showNextLine = (): void => {
      if (lineIndex >= sequence.length) {
        setDone(true);
        return;
      }

      const line = sequence[lineIndex];
      setVisibleLines(lineIndex + 1);

      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }

      lineIndex += 1;
      timer = window.setTimeout(showNextLine, line.delay);
    };

    timer = window.setTimeout(showNextLine, 200);

    return () => window.clearTimeout(timer);
  }, [sequence]);

  return (
    <StyledShutdownScreen>
      {!blacked && (
        <div ref={contentRef} className="shutdown-content">
        {sequence.slice(0, visibleLines).map((line, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={`shutdown-line${line.type ? ` ${line.type}` : ""}`}
          >
            {line.text}
            {index === visibleLines - 1 && !done && (
              <span className="cursor">_</span>
            )}
          </div>
        ))}
        </div>
      )}
    </StyledShutdownScreen>
  );
};

export default memo(ShutdownScreen);

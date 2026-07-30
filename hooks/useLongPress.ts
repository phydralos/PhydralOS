import { useCallback, useRef } from "react";

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 10;

type LongPressHandlers = {
  onTouchEnd: () => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
};

const useLongPress = (
  onLongPress: (e: React.TouchEvent) => void,
  enabled: boolean
): LongPressHandlers => {
  const timerRef = useRef(0);
  const startPosRef = useRef({ x: 0, y: 0 });

  const clearTimer = useCallback((): void => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent): void => {
      if (!enabled) return;

      const touch = e.touches[0];

      startPosRef.current = { x: touch.clientX, y: touch.clientY };

      timerRef.current = window.setTimeout(() => {
        onLongPress(e);
      }, LONG_PRESS_MS);
    },
    [enabled, onLongPress]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent): void => {
      if (!timerRef.current) return;

      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - startPosRef.current.x);
      const dy = Math.abs(touch.clientY - startPosRef.current.y);

      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        clearTimer();
      }
    },
    [clearTimer]
  );

  const onTouchEnd = useCallback((): void => {
    clearTimer();
  }, [clearTimer]);

  return { onTouchEnd, onTouchMove, onTouchStart };
};

export default useLongPress;

import { useEffect, useState } from "react";
import { subscribeToNotifications } from "utils/notifications";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

type Toast = {
  id: number;
  message: string;
  title: string;
};

const ToastNotifications: FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 0;

    const unsubscribe = subscribeToNotifications(({ message, title }) => {
      const id = nextId++;

      setToasts((current) => [...current, { id, message, title }]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 5 * MILLISECONDS_IN_SECOND);
    });

    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        bottom: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "fixed",
        right: "12px",
        zIndex: 999999,
      }}
    >
      {toasts.map(({ id, message, title }) => (
        <div
          key={id}
          style={{
            alignItems: "center",
            animation: "toastSlideIn 0.3s ease",
            background: "rgba(30, 30, 46, 0.95)",
            backdropFilter: "blur(12px)",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
            color: "#cdd6f4",
            display: "flex",
            flexDirection: "column",
            fontFamily: "system-ui, -apple-system, sans-serif",
            gap: "4px",
            maxWidth: "320px",
            minWidth: "240px",
            padding: "12px 16px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: "8px",
              width: "100%",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4"
                stroke="#a6e3a1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="10" stroke="#a6e3a1" strokeWidth="2" />
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600 }}>{title}</span>
          </div>
          <span style={{ fontSize: "12px", color: "#a6adc8" }}>{message}</span>
        </div>
      ))}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default ToastNotifications;

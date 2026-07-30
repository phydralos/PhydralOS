type NotificationListener = (notification: AppNotification) => void;

type AppNotification = {
  message: string;
  title: string;
};

const listeners = new Set<NotificationListener>();

export const notify = (title: string, message: string): void => {
  const notification: AppNotification = { message, title };
  listeners.forEach((listener) => listener(notification));
};

export const subscribeToNotifications = (
  listener: NotificationListener
): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

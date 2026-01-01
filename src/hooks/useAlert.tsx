import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertConfig {
  message: string;
  type?: AlertType;
  duration?: number; // milliseconds, 0 = no auto-close
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  alert: AlertConfig | null;
  isVisible: boolean;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<AlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlert({
      type: config.type || "info",
      message: config.message,
      duration: config.duration !== undefined ? config.duration : 3000, // default 3s
    });
    setIsVisible(true);

    // Auto-close if duration is set
    if (config.duration !== 0) {
      const duration = config.duration !== undefined ? config.duration : 3000;
      setTimeout(() => {
        hideAlert();
      }, duration);
    }
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    // Wait for animation to complete before clearing
    setTimeout(() => {
      setAlert(null);
    }, 300);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alert, isVisible }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

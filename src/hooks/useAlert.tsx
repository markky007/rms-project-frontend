import React, { createContext, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertConfig {
  message: string;
  type?: AlertType;
  duration?: number;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  // properties below are kept for compatibility but might always be "mocked" or unused
  alert: AlertConfig | null;
  isVisible: boolean;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const showAlert = useCallback((config: AlertConfig) => {
    const message = config.message;
    const duration = config.duration !== undefined ? config.duration : 3000;
    const type = config.type || "info";

    const options = {
      duration: config.duration === 0 ? Infinity : duration,
      id: "toast-alert", // Helper ID if we want to dismiss specific one
    };

    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "warning":
        // react-hot-toast doesn't have warning by default, use custom icon or normal
        toast(message, {
          ...options,
          icon: "⚠️",
          style: {
            background: "#fff3cd",
            color: "#856404",
            border: "1px solid #ffeeba",
          },
        });
        break;
      case "info":
      default:
        toast(message, {
          ...options,
          icon: "ℹ️",
        });
        break;
    }
  }, []);

  const hideAlert = useCallback(() => {
    toast.dismiss();
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        hideAlert,
        alert: null, // No longer driven by state
        isVisible: false, // No longer driven by state
      }}
    >
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

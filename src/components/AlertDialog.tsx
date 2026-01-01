import React, { useEffect } from "react";
import { useAlert } from "../hooks/useAlert";
import type { AlertType } from "../hooks/useAlert";

const AlertDialog: React.FC = () => {
  const { alert, isVisible, hideAlert } = useAlert();

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        hideAlert();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isVisible, hideAlert]);

  if (!alert) return null;

  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case "success":
        return {
          bgGradient:
            "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(34, 197, 94, 0.25))",
          borderColor: "rgba(52, 211, 153, 0.8)",
          glowColor: "rgba(52, 211, 153, 0.4)",
          iconBg: "linear-gradient(135deg, #10b981, #34d399)",
          icon: "✓",
          iconRing: "rgba(52, 211, 153, 0.25)",
        };
      case "error":
        return {
          bgGradient:
            "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(244, 63, 94, 0.25))",
          borderColor: "rgba(248, 113, 113, 0.8)",
          glowColor: "rgba(248, 113, 113, 0.4)",
          iconBg: "linear-gradient(135deg, #ef4444, #f87171)",
          icon: "✕",
          iconRing: "rgba(248, 113, 113, 0.25)",
        };
      case "warning":
        return {
          bgGradient:
            "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(251, 146, 60, 0.25))",
          borderColor: "rgba(251, 191, 36, 0.8)",
          glowColor: "rgba(251, 191, 36, 0.4)",
          iconBg: "linear-gradient(135deg, #f59e0b, #fbbf24)",
          icon: "⚠",
          iconRing: "rgba(251, 191, 36, 0.25)",
        };
      case "info":
      default:
        return {
          bgGradient:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(6, 182, 212, 0.25))",
          borderColor: "rgba(96, 165, 250, 0.8)",
          glowColor: "rgba(96, 165, 250, 0.4)",
          iconBg: "linear-gradient(135deg, #3b82f6, #60a5fa)",
          icon: "ℹ",
          iconRing: "rgba(96, 165, 250, 0.25)",
        };
    }
  };

  const styles = getAlertStyles(alert.type || "info");

  return (
    <>
      {/* Toast Notification - Bottom Right */}
      <div
        className={`fixed z-[9999] transition-all duration-500 ease-out ${
          isVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-[120%] pointer-events-none"
        }`}
        style={{
          bottom: "20px",
          right: "20px",
          maxWidth: "380px",
          minWidth: "320px",
        }}
      >
        <div
          className="relative rounded-xl p-4 shadow-2xl"
          style={{
            background: `rgba(255, 255, 255, 0.15)`,
            backgroundImage: styles.bgGradient,
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: `3px solid ${styles.borderColor}`,
            boxShadow: `
              0 25px 70px -15px rgba(0, 0, 0, 0.7),
              0 0 0 1px rgba(255, 255, 255, 0.2) inset,
              0 0 50px ${styles.glowColor},
              0 10px 40px ${styles.glowColor}
            `,
          }}
        >
          {/* Close button */}
          <button
            onClick={hideAlert}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 hover:rotate-90"
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.1)";
            }}
            aria-label="ปิด"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          {/* Content */}
          <div className="flex flex-col items-center text-center gap-3">
            {/* Icon */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                background: styles.iconBg,
                boxShadow: `
                  0 0 0 3px ${styles.iconRing},
                  0 6px 16px -4px ${styles.glowColor}
                `,
                animation: "iconPulse 3s ease-in-out infinite",
              }}
            >
              <span className="text-white text-xl font-bold drop-shadow-lg">
                {styles.icon}
              </span>
            </div>

            {/* Message */}
            <div className="w-full px-2">
              <p
                className="text-white text-sm font-semibold leading-relaxed"
                style={{
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                }}
              >
                {alert.message}
              </p>
            </div>
          </div>

          {/* Progress bar for auto-close */}
          {alert.duration !== 0 && (
            <div
              className="mt-3 h-0.5 rounded-full overflow-hidden"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.2) inset",
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: styles.iconBg,
                  boxShadow: `0 0 10px ${styles.glowColor}`,
                  animation: `progress ${alert.duration}ms linear forwards`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
};

export default AlertDialog;

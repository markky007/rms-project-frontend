import React, { useEffect, useRef } from "react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Manage body scroll and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      // Focus the modal itself or first element inside
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = "";
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus trap cycling
  const handleTabKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (!focusableElements.length) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  };

  if (!isOpen) return null;

  const sizeWidths = {
    sm: "max-w-[28rem]", // 448px
    md: "max-w-[32rem]", // 512px
    lg: "max-w-[42rem]", // 672px
    xl: "max-w-[56rem]", // 896px
  };

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      onKeyDown={handleTabKey}
    >
      {/* Backdrop overlay - oklch(0 0 0 / 0.40) + blur(4px) */}
      <div
        className="fixed inset-0 bg-[#000000]/40 backdrop-blur-[4px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card - oklch design, Elevate shadow */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full bg-white rounded-lg shadow-elevated overflow-hidden transform transition-all duration-200 ease-out-quart focus:outline-none ${sizeWidths[size]}`}
      >
        {/* Header section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2
            id="modal-title"
            className="font-heading text-lg font-semibold text-ink"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:bg-surface hover:text-ink rounded-full p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="ปิดกล่องข้อความ"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body content */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto font-sans text-sm text-ink leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;

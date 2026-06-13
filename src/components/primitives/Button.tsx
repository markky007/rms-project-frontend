import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  // Base classes mapping to DESIGN.md tokens
  const baseClasses =
    "inline-flex items-center justify-center font-sans font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-2 active:scale-95 disabled:opacity-40 disabled:pointer-events-none";

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  // Variant classes mapping to tokens
  const variantClasses = {
    primary:
      "bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-medium active:translate-y-0 active:bg-primary-active focus-visible:ring-primary/20",
    secondary:
      "bg-surface text-ink border border-border hover:border-ink/20 hover:bg-surface/80 focus-visible:ring-primary/20",
    danger:
      "bg-error text-white hover:bg-error-light hover:opacity-90 active:bg-error focus-visible:ring-error/25",
    ghost:
      "bg-transparent text-primary hover:bg-surface active:bg-surface/80 focus-visible:ring-primary/20",
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          กำลังโหลด...
        </>
      ) : (
        children
      )}
    </button>
  );
};
export default Button;

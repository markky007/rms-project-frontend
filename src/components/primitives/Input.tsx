import React, { useId } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, required, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Base styles from DESIGN.md
    const baseInputClasses =
      "w-full bg-white text-ink border border-border rounded-md px-3.5 py-2.5 font-sans text-sm transition-all duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-surface disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-muted";

    const borderClasses = error
      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
      : "border-border";

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-ink font-sans flex items-center gap-1 select-none"
          >
            {label}
            {required && <span className="text-error" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`${baseInputClasses} ${borderClasses} ${className}`}
          {...props}
        />
        {error ? (
          <p
            id={errorId}
            className="text-xs font-medium text-error font-sans flex items-center gap-1 animate-shake"
            role="alert"
          >
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-muted font-sans">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

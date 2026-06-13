import React, { useId } from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, children, className = "", id, required, ...props }, ref) => {
    const defaultId = useId();
    const selectId = id || defaultId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const baseSelectClasses =
      "w-full bg-white text-ink border border-border rounded-md px-3.5 py-2.5 font-sans text-sm appearance-none transition-all duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-surface disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer pr-10";

    const borderClasses = error
      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
      : "border-border";

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-ink font-sans flex items-center gap-1 select-none"
          >
            {label}
            {required && <span className="text-error" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`${baseSelectClasses} ${borderClasses} ${className}`}
            {...props}
          >
            {children}
          </select>
          {/* Custom Chevron Down Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-muted">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
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

Select.displayName = "Select";
export default Select;

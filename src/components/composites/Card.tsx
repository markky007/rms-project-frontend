import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
  noPadding?: boolean;
  borderOnly?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverLift = false,
  noPadding = false,
  borderOnly = false,
  className = "",
  ...props
}) => {
  const baseClasses = "bg-white rounded-lg transition-all duration-150";

  // Shadow class based on DESIGN.md (Ambient Low at rest)
  const shadowClass = borderOnly
    ? "border border-border"
    : "shadow-low border border-border-subtle";

  const hoverClass = hoverLift
    ? "hover:shadow-medium hover:-translate-y-0.5 hover:border-border cursor-pointer"
    : "";

  const paddingClass = noPadding ? "p-0" : "p-6"; // p-6 is 24px matching var(--space-lg)

  return (
    <div
      className={`${baseClasses} ${shadowClass} ${hoverClass} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

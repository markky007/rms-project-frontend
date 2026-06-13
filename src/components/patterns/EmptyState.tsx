import React from "react";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-border rounded-lg text-center gap-4 font-sans max-w-md mx-auto">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-surface text-muted">
        {icon || (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-semibold text-ink">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;

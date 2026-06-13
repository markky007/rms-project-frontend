import React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl md:text-[30px] font-semibold text-ink leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

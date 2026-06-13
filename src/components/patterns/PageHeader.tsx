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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl lg:text-[30px] font-semibold text-ink leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs lg:text-sm text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

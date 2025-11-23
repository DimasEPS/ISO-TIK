import React from "react";

function SidebarHeader({
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
  action,
}) {
  if (!title && !subtitle && !action) return null;

  return (
    <div className="px-8 pb-4 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {title && (
            <h2 className={titleClassName ?? "heading-3 text-navy"}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={subtitleClassName ?? "text-gray-dark text-[14px] font-normal"}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export function BaseSidebar({
  title,
  subtitle,
  children,
  className = "",
  titleClassName,
  subtitleClassName,
  dividerClassName = "border-navy-hover",
  headerSpacing = true,
  headerAction,
}) {
  return (
    <aside className={`fixed left-0 top-0 h-screen w-[294px] bg-gray-light border-r border-navy flex flex-col ${className}`}>
      <SidebarHeader
        title={title}
        subtitle={subtitle}
        titleClassName={titleClassName}
        subtitleClassName={subtitleClassName}
        action={headerAction}
      />

      {headerSpacing && <hr className={dividerClassName} />}

      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </aside>
  );
}

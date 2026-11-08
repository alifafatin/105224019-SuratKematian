import React from 'react';

export interface CardInfoProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: 'default' | 'primary' | 'warning' | 'success' | 'info';
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
  ariaLabel?: string;
}

export function CardInfo({
  title,
  value,
  subtitle,
  icon,
  badge,
  variant = 'default',
  children,
  footer,
  className = '',
  headingLevel = 'h3',
  ariaLabel,
}: CardInfoProps) {
  const HeadingTag = headingLevel;

  const accentBorder: Record<string, string> = {
    default: 'border-slate-200 hover:border-slate-300',
    primary: 'border-blue-200 border-l-4 border-l-blue-600',
    warning: 'border-amber-200 border-l-4 border-l-amber-600',
    success: 'border-emerald-200 border-l-4 border-l-emerald-600',
    info: 'border-indigo-200 border-l-4 border-l-indigo-600',
  };

  return (
    <article
      aria-label={ariaLabel || title}
      className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-md ${accentBorder[variant]} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <HeadingTag className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-700">
            {title}
          </HeadingTag>

          {value !== undefined && (
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {value}
              </span>
            </div>
          )}

          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {icon && (
            <div className="p-2 sm:p-2.5 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              {icon}
            </div>
          )}
          {badge && <div>{badge}</div>}
        </div>
      </div>

      {children && <div className="mt-4 pt-3 border-t border-slate-100">{children}</div>}

      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
          {footer}
        </div>
      )}
    </article>
  );
}

export default CardInfo;


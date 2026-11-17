import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href: string;
  onClick?: () => void;
  current?: boolean;
}

interface BreadcrumbsNavProps {
  items: BreadcrumbItem[];
  rightSlot?: React.ReactNode;
  className?: string;
}

export function BreadcrumbsNav({ items, rightSlot, className = '' }: BreadcrumbsNavProps) {
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const resolveHref = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.replace(/^\/+/, '');
    return clean ? `${basePath}${clean}` : basePath;
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center justify-between gap-2 text-xs text-[#5B6A80] dark:text-[#94A3B8] ${className}`}
    >
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className="flex flex-wrap items-center gap-1.5"
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1 || item.current;
          const href = resolveHref(item.href);

          return (
            <li
              key={`${item.label}-${idx}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="inline-flex items-center gap-1.5"
            >
              {idx > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-[#94A3B8] dark:text-[#5B6A80] shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  itemProp="name"
                  aria-current="page"
                  className="text-[#171927] dark:text-[#F8F7FC] font-semibold"
                >
                  {item.label}
                </span>
              ) : (
                <a
                  itemProp="item"
                  href={href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className="inline-flex items-center gap-1 hover:text-[#7047EB] dark:hover:text-[#A78BFA] transition-colors font-medium cursor-pointer"
                >
                  {idx === 0 && <Home className="w-3.5 h-3.5 text-[#7047EB] shrink-0" />}
                  <span itemProp="name">{item.label}</span>
                </a>
              )}
              <meta itemProp="position" content={String(idx + 1)} />
            </li>
          );
        })}
      </ol>

      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </nav>
  );
}

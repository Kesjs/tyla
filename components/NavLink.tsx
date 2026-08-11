'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * NavLink wrapper with instant visual feedback on click
 * Adds opacity transition for perceived speed
 */
export function NavLink({
  href,
  children,
  className = '',
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={`transition-opacity duration-150 active:opacity-60 ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

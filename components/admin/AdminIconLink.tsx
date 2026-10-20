"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { IconTooltip } from "@/components/IconTooltip";

type AdminIconLinkProps = {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
};

export function AdminIconLink({
  href,
  label,
  className = "admin-icon-btn",
  children,
}: AdminIconLinkProps) {
  return (
    <IconTooltip
      label={label}
      render={
        <Link href={href} className={className} aria-label={label} />
      }
    >
      {children}
    </IconTooltip>
  );
}

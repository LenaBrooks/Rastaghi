"use client";

import type { ReactElement, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type IconTooltipProps = {
  label: string;
  /** Native element used as the trigger (button, Link, etc.) */
  render: ReactElement;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
};

export function IconTooltip({
  label,
  render,
  children,
  side = "top",
}: IconTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={render}>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}

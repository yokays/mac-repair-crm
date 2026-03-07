"use client";

import React from "react";
import {
  STATUS_COLORS,
  getStatusLabel,
  getStatusIcon,
} from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  repairType?: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  repairType = "LOCAL",
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const colorClasses = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  const label = getStatusLabel(status, repairType);
  const icon = getStatusIcon(status, repairType);

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full border px-3 py-1
        text-xs font-medium
        whitespace-nowrap
        ${colorClasses}
        ${className}
      `}
    >
      {showIcon && <span className="text-sm leading-none">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;

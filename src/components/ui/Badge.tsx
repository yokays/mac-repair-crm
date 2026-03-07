"use client";

import React from "react";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border-green-200 ring-green-600/20",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-600/20",
  danger: "bg-red-50 text-red-700 border-red-200 ring-red-600/20",
  info: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20",
  neutral: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-600/20",
  purple: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full border px-2.5 py-0.5
        text-xs font-medium
        ring-1 ring-inset
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;

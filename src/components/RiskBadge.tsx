import React from "react";
import { RiskLevel } from "../types";
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  emoji?: string;
  size?: "sm" | "md" | "lg";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, emoji, size = "md" }) => {
  let config = {
    bg: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    label: "Risco Baixo",
    defaultEmoji: "🟢",
  };

  if (level === "Muito Alto") {
    config = {
      bg: "bg-red-950/90 border-red-500/50 text-red-200 animate-pulse",
      icon: <AlertOctagon className="w-5 h-5 text-red-400" />,
      label: "Risco Muito Alto",
      defaultEmoji: "🔴",
    };
  } else if (level === "Alto") {
    config = {
      bg: "bg-orange-950/90 border-orange-500/50 text-orange-200",
      icon: <ShieldAlert className="w-4 h-4 text-orange-400" />,
      label: "Risco Alto",
      defaultEmoji: "🟠",
    };
  } else if (level === "Médio") {
    config = {
      bg: "bg-yellow-950/90 border-yellow-500/50 text-yellow-200",
      icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
      label: "Risco Médio",
      defaultEmoji: "🟡",
    };
  }

  const displayEmoji = emoji || config.defaultEmoji;

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5 font-bold",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border shadow-sm ${config.bg} ${sizeClasses}`}
    >
      <span className="text-base leading-none">{displayEmoji}</span>
      <span>{config.label}</span>
    </span>
  );
};

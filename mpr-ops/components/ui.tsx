"use client";

import { type ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-[#2e3250] bg-[#1a1d27] p-4 ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-semibold text-[#e8eaf6] mb-4">{children}</h2>;
}

export function Badge({
  children,
  color = "default",
}: {
  children: ReactNode;
  color?: "red" | "yellow" | "green" | "blue" | "purple" | "orange" | "default";
}) {
  const colors = {
    red: "bg-red-500/20 text-red-300",
    yellow: "bg-yellow-500/20 text-yellow-300",
    green: "bg-green-500/20 text-green-300",
    blue: "bg-blue-500/20 text-blue-300",
    purple: "bg-purple-500/20 text-purple-300",
    orange: "bg-orange-500/20 text-orange-300",
    default: "bg-[#22263a] text-[#8892b0]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: "RED" | "YELLOW" | "GREEN" }) {
  const colors = {
    RED: "bg-red-500",
    YELLOW: "bg-yellow-400",
    GREEN: "bg-green-400",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />;
}

export function ProgressBar({
  value,
  max = 100,
  color = "blue",
}: {
  value: number;
  max?: number;
  color?: "blue" | "green" | "red" | "yellow" | "orange";
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    orange: "bg-orange-500",
  };
  return (
    <div className="w-full h-1.5 bg-[#22263a] rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${colors[color]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function KPICard({
  label,
  value,
  target,
  unit,
  lowerIsBetter = false,
  delta,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  lowerIsBetter?: boolean;
  delta?: string;
}) {
  const met = lowerIsBetter ? value <= target : value >= target;
  return (
    <Card>
      <div className="text-xs text-[#8892b0] mb-1">{label}</div>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold ${met ? "text-green-400" : "text-red-400"}`}>
          {value}{unit}
        </span>
        <span className="text-xs text-[#8892b0] mb-1">target: {target}{unit}</span>
      </div>
      {delta && <div className="text-xs text-[#8892b0] mt-1">{delta}</div>}
      <ProgressBar
        value={lowerIsBetter ? Math.max(0, target * 2 - value) : value}
        max={lowerIsBetter ? target * 2 : 100}
        color={met ? "green" : value / target > (lowerIsBetter ? 1 : 0.85) ? "yellow" : "red"}
      />
    </Card>
  );
}

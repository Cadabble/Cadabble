"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Command Center", icon: "⚡" },
  { href: "/events", label: "Event Matrix", icon: "📋" },
  { href: "/cross-training", label: "Cross-Training", icon: "🔄" },
  { href: "/staffing", label: "Float & Staffing", icon: "👥" },
  { href: "/incidents", label: "Incident Command", icon: "🚨" },
  { href: "/readiness", label: "Op Readiness", icon: "✅" },
  { href: "/forecasting", label: "Labor Forecast", icon: "📈" },
  { href: "/labor", label: "Financial Intel", icon: "💰" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen sticky top-0 border-r border-[#2e3250] bg-[#1a1d27]">
      <div className="px-4 py-5 border-b border-[#2e3250]">
        <div className="text-xs font-bold tracking-widest text-[#4f8ef7] uppercase">MPR OPS OS</div>
        <div className="text-[10px] text-[#8892b0] mt-0.5">Manning Park Resort · V2.0</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[#4f8ef7]/10 text-[#4f8ef7] border-r-2 border-[#4f8ef7]"
                  : "text-[#8892b0] hover:text-[#e8eaf6] hover:bg-[#22263a]"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-[#2e3250] text-[10px] text-[#8892b0]">
        <div>Jason Frost · Operations</div>
        <div className="text-[#4f8ef7] mt-0.5">Live · 2026-05-19</div>
      </div>
    </aside>
  );
}

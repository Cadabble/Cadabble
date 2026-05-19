"use client";

import { Card } from "@/components/ui";
import { FORECAST, STAFF, BEO_EVENTS, DEPT_BG, DEPT_COLORS } from "@/lib/data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CUSTOM_TOOLTIP = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded bg-[#22263a] border border-[#2e3250] p-2 text-[10px]">
      <div className="font-semibold text-[#e8eaf6] mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.name.includes("$") ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
};

export default function LaborPage() {
  const totalWeekRevenue = FORECAST.reduce((s, d) => s + d.revenueProjected, 0);
  const totalWeekLabor = FORECAST.reduce((s, d) => s + d.laborCostProjected, 0);
  const avgLaborRatio = Math.round((totalWeekLabor / totalWeekRevenue) * 100);

  const laborRatioData = FORECAST.map((d) => ({
    day: d.dayOfWeek,
    "Revenue ($)": d.revenueProjected,
    "Labor Cost ($)": d.laborCostProjected,
    "Labor Ratio %": Math.round((d.laborCostProjected / d.revenueProjected) * 100),
  }));

  const overtimeRisk = STAFF.filter((s) => s.hoursThisWeek >= s.maxHours * 0.9);
  const totalWeeklyLaborCost = STAFF.reduce(
    (s, emp) => s + emp.hoursThisWeek * emp.laborRate,
    0
  );
  const overtimeCostRisk = overtimeRisk.reduce(
    (s, emp) => s + (emp.maxHours - emp.hoursThisWeek) * emp.laborRate * 1.5,
    0
  );

  const eventProfit = BEO_EVENTS.map((ev) => ({
    name: ev.name.split(" ").slice(0, 2).join(" "),
    revenue: ev.revenueEstimate,
    labor: ev.laborCostEstimate,
    profit: ev.revenueEstimate - ev.laborCostEstimate,
    margin: Math.round(((ev.revenueEstimate - ev.laborCostEstimate) / ev.revenueEstimate) * 100),
  }));

  const deptLaborCost = Object.entries(
    STAFF.reduce((acc, s) => {
      const dept = s.primaryDepartment;
      acc[dept] = (acc[dept] ?? 0) + s.hoursThisWeek * s.laborRate;
      return acc;
    }, {} as Record<string, number>)
  ).map(([dept, cost]) => ({ dept, cost })).sort((a, b) => b.cost - a.cost);

  const PIE_COLORS = deptLaborCost.map((d) => DEPT_COLORS[d.dept as keyof typeof DEPT_COLORS] ?? "#6b7280");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e8eaf6]">Financial + Labor Intelligence</h1>
          <p className="text-sm text-[#8892b0] mt-0.5">
            Operational profitability visibility · Labor costs · Overtime exposure · Revenue protection
          </p>
        </div>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Week Revenue (Projected)",
            value: `$${(totalWeekRevenue / 1000).toFixed(0)}k`,
            sub: "7-day total",
            color: "text-green-400",
          },
          {
            label: "Week Labor Cost",
            value: `$${(totalWeekLabor / 1000).toFixed(0)}k`,
            sub: "projected total",
            color: "text-orange-400",
          },
          {
            label: "Avg Labor Ratio",
            value: `${avgLaborRatio}%`,
            sub: "labor/revenue",
            color: avgLaborRatio > 35 ? "text-red-400" : avgLaborRatio > 28 ? "text-yellow-400" : "text-green-400",
          },
          {
            label: "Overtime Risk",
            value: `$${overtimeCostRisk.toFixed(0)}`,
            sub: `${overtimeRisk.length} staff at risk`,
            color: overtimeRisk.length > 0 ? "text-red-400" : "text-green-400",
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="text-[10px] text-[#8892b0] mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-[#8892b0] mt-0.5">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Revenue vs Labor chart */}
      <Card>
        <div className="text-sm font-semibold text-[#e8eaf6] mb-4">
          Revenue vs Labor Cost — 7-Day View
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={laborRatioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3250" />
            <XAxis dataKey="day" tick={{ fill: "#8892b0", fontSize: 11 }} />
            <YAxis tick={{ fill: "#8892b0", fontSize: 11 }} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#8892b0" }} />
            <Area
              type="monotone"
              dataKey="Revenue ($)"
              stroke="#36d399"
              fill="#36d39920"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Labor Cost ($)"
              stroke="#fb923c"
              fill="#fb923c20"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Event Profitability */}
        <Card>
          <div className="text-sm font-semibold text-[#e8eaf6] mb-4">Event Profitability Analysis</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={eventProfit}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3250" />
              <XAxis dataKey="name" tick={{ fill: "#8892b0", fontSize: 10 }} />
              <YAxis tick={{ fill: "#8892b0", fontSize: 10 }} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#8892b0" }} />
              <Bar dataKey="revenue" fill="#36d399" name="Revenue ($)" opacity={0.8} />
              <Bar dataKey="labor" fill="#fb923c" name="Labor ($)" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {eventProfit.map((ev) => (
              <div key={ev.name} className="flex items-center justify-between text-xs">
                <span className="text-[#8892b0] truncate mr-2">{ev.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-green-400">${ev.profit.toLocaleString()} profit</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ev.margin >= 80
                        ? "bg-green-500/20 text-green-400"
                        : ev.margin >= 60
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {ev.margin}% margin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Department labor breakdown */}
        <Card>
          <div className="text-sm font-semibold text-[#e8eaf6] mb-4">Labor Cost by Department (This Week)</div>
          <div className="flex gap-4">
            <div className="flex-1">
              <PieChart width={160} height={160}>
                <Pie
                  data={deptLaborCost}
                  cx={75}
                  cy={75}
                  outerRadius={70}
                  dataKey="cost"
                >
                  {deptLaborCost.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => typeof v === "number" ? `$${v.toLocaleString()}` : v} />
              </PieChart>
            </div>
            <div className="flex-1 space-y-2">
              {deptLaborCost.map((d, i) => (
                <div key={d.dept} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className={`text-[9px] px-1 rounded ${DEPT_BG[d.dept as keyof typeof DEPT_BG] ?? "bg-gray-500/20 text-gray-300"}`}>
                      {d.dept}
                    </span>
                  </div>
                  <span className="text-xs text-[#e8eaf6]">${d.cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Overtime Exposure */}
      <Card>
        <div className="text-sm font-semibold text-[#e8eaf6] mb-3">Overtime Exposure Tracker</div>
        {overtimeRisk.length === 0 ? (
          <div className="text-sm text-green-400">No overtime risk this week.</div>
        ) : (
          <div className="space-y-2">
            {overtimeRisk.map((s) => {
              const pct = Math.round((s.hoursThisWeek / s.maxHours) * 100);
              const overtimeH = Math.max(0, s.hoursThisWeek - s.maxHours);
              const overtimeCost = overtimeH * s.laborRate * 1.5;
              return (
                <div key={s.id} className="flex items-center gap-3 rounded border border-yellow-500/30 bg-yellow-500/5 p-2.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#e8eaf6]">{s.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${DEPT_BG[s.primaryDepartment] ?? "bg-gray-500/20 text-gray-300"}`}>
                        {s.primaryDepartment}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8892b0] mt-0.5">
                      {s.hoursThisWeek}h / {s.maxHours}h this week · ${s.laborRate}/h
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold ${pct >= 100 ? "text-red-400" : "text-yellow-400"}`}>
                      {pct}%
                    </div>
                    {overtimeH > 0 && (
                      <div className="text-[10px] text-red-400">{overtimeH}h OT · ${overtimeCost.toFixed(0)}</div>
                    )}
                    {!s.available && <div className="text-[10px] text-gray-500">Unavailable</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Float efficiency */}
        <div className="mt-4 border-t border-[#2e3250] pt-4">
          <div className="text-xs font-semibold text-[#8892b0] uppercase mb-2">Float Team Efficiency</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#22263a] rounded p-2">
              <div className="text-lg font-bold text-[#4f8ef7]">
                ${STAFF.filter((s) => s.isFloat).reduce((sum, s) => sum + s.hoursThisWeek * s.laborRate, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-[#8892b0]">Float Labor Cost</div>
            </div>
            <div className="bg-[#22263a] rounded p-2">
              <div className="text-lg font-bold text-green-400">
                {STAFF.filter((s) => s.isFloat && s.available).length}/
                {STAFF.filter((s) => s.isFloat).length}
              </div>
              <div className="text-[10px] text-[#8892b0]">Float Available</div>
            </div>
            <div className="bg-[#22263a] rounded p-2">
              <div className="text-lg font-bold text-purple-400">
                {STAFF.filter((s) => s.isFloat).reduce((s, e) => s + e.maxHours - e.hoursThisWeek, 0)}h
              </div>
              <div className="text-[10px] text-[#8892b0]">Float Capacity Remaining</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

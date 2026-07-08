"use client";

import { Card } from "@/components/ui";
import { FORECAST, DEPT_BG, DEPT_COLORS } from "@/lib/data";
import type { Department } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from "recharts";

const DEPTS_TO_SHOW: Department[] = [
  "Front Desk", "F&B", "Housekeeping", "Ski Operations",
];

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
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function ForecastingPage() {
  const occupancyData = FORECAST.map((d) => ({
    day: d.dayOfWeek,
    occupancy: d.predictedOccupancy,
    guests: d.predictedGuests,
    events: d.eventsCount,
  }));

  const coverageData = FORECAST.map((d) => {
    const entry: Record<string, string | number> = { day: d.dayOfWeek };
    DEPTS_TO_SHOW.forEach((dept) => {
      const req = d.recommendedStaff[dept] ?? 0;
      const sched = d.scheduledStaff[dept] ?? 0;
      entry[`${dept} Required`] = req;
      entry[`${dept} Scheduled`] = sched;
    });
    return entry;
  });

  const laborData = FORECAST.map((d) => ({
    day: d.dayOfWeek,
    labor: d.laborCostProjected,
    revenue: d.revenueProjected,
    laborRatio: Math.round((d.laborCostProjected / d.revenueProjected) * 100),
  }));

  const avgOcc = Math.round(FORECAST.reduce((s, d) => s + d.predictedOccupancy, 0) / FORECAST.length);
  const peakDay = FORECAST.reduce((a, b) => (a.predictedOccupancy > b.predictedOccupancy ? a : b));
  const weekendRevenue = FORECAST.filter((d) => ["Fri", "Sat", "Sun"].includes(d.dayOfWeek))
    .reduce((s, d) => s + d.revenueProjected, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e8eaf6]">Labor Forecast</h1>
          <p className="text-sm text-[#8892b0] mt-0.5">
            7-day operational demand prediction · Staffing recommendations
          </p>
        </div>
        <div className="flex gap-4">
          {[
            { label: "Avg Occupancy", value: `${avgOcc}%`, color: "text-[#4f8ef7]" },
            { label: "Peak Day", value: peakDay.dayOfWeek, color: "text-orange-400" },
            { label: "Weekend Revenue", value: `$${(weekendRevenue / 1000).toFixed(0)}k`, color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[#8892b0]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Occupancy + Guest forecast */}
      <Card>
        <div className="text-sm font-semibold text-[#e8eaf6] mb-4">
          7-Day Occupancy & Guest Forecast
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={occupancyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3250" />
            <XAxis dataKey="day" tick={{ fill: "#8892b0", fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: "#8892b0", fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#8892b0", fontSize: 11 }} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#8892b0" }} />
            <Line yAxisId="left" type="monotone" dataKey="occupancy" stroke="#4f8ef7" strokeWidth={2} dot={true} name="Occupancy %" />
            <Line yAxisId="right" type="monotone" dataKey="guests" stroke="#36d399" strokeWidth={2} dot={true} name="Guest Count" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Staffing recommendation vs scheduled */}
      <Card>
        <div className="text-sm font-semibold text-[#e8eaf6] mb-4">
          Staffing Requirement vs Scheduled (Key Departments)
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={coverageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3250" />
            <XAxis dataKey="day" tick={{ fill: "#8892b0", fontSize: 11 }} />
            <YAxis tick={{ fill: "#8892b0", fontSize: 11 }} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#8892b0" }} />
            {DEPTS_TO_SHOW.flatMap((dept) => [
              <Bar key={`${dept}-req`} dataKey={`${dept} Required`} fill={DEPT_COLORS[dept]} opacity={0.5} />,
              <Bar key={`${dept}-sched`} dataKey={`${dept} Scheduled`} fill={DEPT_COLORS[dept]} opacity={1} />,
            ])}
          </BarChart>
        </ResponsiveContainer>
        <div className="text-[10px] text-[#8892b0] mt-2">
          Solid = Scheduled · Faded = Required. Gap indicates understaffing risk.
        </div>
      </Card>

      {/* Daily forecast table */}
      <Card>
        <div className="text-sm font-semibold text-[#e8eaf6] mb-3">Daily Staffing Forecast Table</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2e3250]">
                <th className="text-left py-2 text-[#8892b0]">Day</th>
                <th className="text-center py-2 text-[#8892b0]">Occ %</th>
                <th className="text-center py-2 text-[#8892b0]">Guests</th>
                <th className="text-center py-2 text-[#8892b0]">Events</th>
                {DEPTS_TO_SHOW.map((d) => (
                  <th key={d} className="text-center py-2">
                    <span className={`text-[9px] px-1 rounded ${DEPT_BG[d] ?? "bg-gray-500/20 text-gray-300"}`}>
                      {d.split(" ")[0]}
                    </span>
                  </th>
                ))}
                <th className="text-right py-2 text-[#8892b0]">Alert</th>
              </tr>
            </thead>
            <tbody>
              {FORECAST.map((day) => {
                const hasGap = DEPTS_TO_SHOW.some(
                  (d) => (day.scheduledStaff[d] ?? 0) < (day.recommendedStaff[d] ?? 0)
                );
                const isHighPressure = day.predictedOccupancy >= 90;
                return (
                  <tr key={day.date} className="border-b border-[#2e3250]/50">
                    <td className="py-2">
                      <div className="font-medium text-[#e8eaf6]">{day.dayOfWeek}</div>
                      <div className="text-[10px] text-[#8892b0]">{day.date.slice(5)}</div>
                    </td>
                    <td className="py-2 text-center">
                      <span className={`font-bold ${day.predictedOccupancy >= 90 ? "text-orange-400" : "text-[#e8eaf6]"}`}>
                        {day.predictedOccupancy}%
                      </span>
                    </td>
                    <td className="py-2 text-center text-[#e8eaf6]">{day.predictedGuests}</td>
                    <td className="py-2 text-center">
                      {day.eventsCount > 0 ? (
                        <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px]">
                          {day.eventsCount}
                        </span>
                      ) : (
                        <span className="text-[#8892b0]">—</span>
                      )}
                    </td>
                    {DEPTS_TO_SHOW.map((d) => {
                      const req = day.recommendedStaff[d] ?? 0;
                      const sched = day.scheduledStaff[d] ?? 0;
                      const gap = req - sched;
                      return (
                        <td key={d} className="py-2 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <span className="text-[#e8eaf6]">{sched}</span>
                            <span className="text-[#8892b0]">/</span>
                            <span className="text-[#8892b0]">{req}</span>
                          </div>
                          {gap > 0 && (
                            <div className="text-[9px] text-red-400 font-bold">−{gap}</div>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2 text-right">
                      {isHighPressure && hasGap ? (
                        <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                          RED
                        </span>
                      ) : hasGap ? (
                        <span className="text-[9px] font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                          YELLOW
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                          GREEN
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

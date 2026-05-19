"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { STAFF, SHIFT_CONFLICTS, DEPT_BG, DEPARTMENTS } from "@/lib/data";
import type { Department } from "@/lib/types";

const SHIFT_DAYS = ["Tue 5/19", "Wed 5/20", "Thu 5/21", "Fri 5/22", "Sat 5/23"];

const DEPT_REQUIRED: Partial<Record<Department, Record<string, number>>> = {
  "Front Desk": { "Tue 5/19": 3, "Wed 5/20": 3, "Thu 5/21": 4, "Fri 5/22": 5, "Sat 5/23": 6 },
  "F&B": { "Tue 5/19": 5, "Wed 5/20": 5, "Thu 5/21": 7, "Fri 5/22": 9, "Sat 5/23": 12 },
  "Housekeeping": { "Tue 5/19": 7, "Wed 5/20": 7, "Thu 5/21": 8, "Fri 5/22": 10, "Sat 5/23": 12 },
  "Maintenance": { "Tue 5/19": 2, "Wed 5/20": 2, "Thu 5/21": 2, "Fri 5/22": 3, "Sat 5/23": 3 },
  "Security": { "Tue 5/19": 1, "Wed 5/20": 1, "Thu 5/21": 2, "Fri 5/22": 2, "Sat 5/23": 3 },
  "Kitchen": { "Tue 5/19": 3, "Wed 5/20": 3, "Thu 5/21": 4, "Fri 5/22": 5, "Sat 5/23": 6 },
  "Ski Operations": { "Tue 5/19": 5, "Wed 5/20": 5, "Thu 5/21": 5, "Fri 5/22": 8, "Sat 5/23": 8 },
  "Activities": { "Tue 5/19": 2, "Wed 5/20": 1, "Thu 5/21": 2, "Fri 5/22": 3, "Sat 5/23": 3 },
};

const DEPT_SCHEDULED: Partial<Record<Department, Record<string, number>>> = {
  "Front Desk": { "Tue 5/19": 3, "Wed 5/20": 3, "Thu 5/21": 3, "Fri 5/22": 4, "Sat 5/23": 5 },
  "F&B": { "Tue 5/19": 5, "Wed 5/20": 5, "Thu 5/21": 6, "Fri 5/22": 8, "Sat 5/23": 10 },
  "Housekeeping": { "Tue 5/19": 6, "Wed 5/20": 7, "Thu 5/21": 7, "Fri 5/22": 9, "Sat 5/23": 11 },
  "Maintenance": { "Tue 5/19": 2, "Wed 5/20": 2, "Thu 5/21": 2, "Fri 5/22": 2, "Sat 5/23": 3 },
  "Security": { "Tue 5/19": 1, "Wed 5/20": 1, "Thu 5/21": 1, "Fri 5/22": 2, "Sat 5/23": 2 },
  "Kitchen": { "Tue 5/19": 3, "Wed 5/20": 3, "Thu 5/21": 4, "Fri 5/22": 4, "Sat 5/23": 5 },
  "Ski Operations": { "Tue 5/19": 5, "Wed 5/20": 5, "Thu 5/21": 5, "Fri 5/22": 7, "Sat 5/23": 8 },
  "Activities": { "Tue 5/19": 2, "Wed 5/20": 1, "Thu 5/21": 2, "Fri 5/22": 2, "Sat 5/23": 3 },
};

function pressure(scheduled: number, required: number): number {
  return Math.min(100, Math.round((scheduled / required) * 100));
}

function statusColor(pct: number, required: number, scheduled: number): string {
  if (scheduled >= required) return "text-green-400";
  if (pct >= 85) return "text-yellow-400";
  return "text-red-400";
}

function statusLabel(pct: number, required: number, scheduled: number): { label: string; badge: string } {
  if (scheduled >= required) return { label: "GREEN", badge: "bg-green-500/20 text-green-400" };
  if (pct >= 85) return { label: "YELLOW", badge: "bg-yellow-500/20 text-yellow-400" };
  return { label: "RED", badge: "bg-red-500/20 text-red-400" };
}

export default function StaffingPage() {
  const [selectedDay, setSelectedDay] = useState("Sat 5/23");

  const floatStaff = STAFF.filter((s) => s.floatEligible);
  const nonFloatStaff = STAFF.filter((s) => !s.floatEligible);

  const staffPressure = Math.round(
    (STAFF.filter((s) => s.hoursThisWeek / s.maxHours > 0.85).length / STAFF.length) * 100
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e8eaf6]">Float Team & Staffing Intelligence</h1>
          <p className="text-sm text-[#8892b0] mt-0.5">
            Shift conflict detector · Float deployment · Coverage gaps
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className={`text-xl font-bold ${staffPressure > 85 ? "text-red-400" : staffPressure > 70 ? "text-yellow-400" : "text-green-400"}`}>
              {staffPressure}%
            </div>
            <div className="text-[10px] text-[#8892b0]">Staff Pressure</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#4f8ef7]">{floatStaff.filter(s => s.available).length}</div>
            <div className="text-[10px] text-[#8892b0]">Float Available</div>
          </div>
        </div>
      </div>

      {/* Automation trigger banner */}
      {staffPressure > 85 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
          <div className="text-xs text-[#e8eaf6]">
            <span className="font-bold text-red-400">[AUTOMATION RULE 1 TRIGGERED]</span> Staffing pressure exceeds 85% threshold.
            Float deployment recommended · Command center notified · Executive dashboard updated.
          </div>
        </div>
      )}

      {/* Conflict Detector */}
      <Card>
        <div className="text-sm font-semibold text-[#e8eaf6] mb-3">Shift Conflict Detector</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SHIFT_CONFLICTS.map((c, i) => {
            const sev = c.severity;
            const styles = {
              RED: "border-red-500/40 bg-red-500/10 text-red-300",
              YELLOW: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
              GREEN: "border-green-500/40 bg-green-500/10 text-green-300",
            };
            return (
              <div key={i} className={`flex items-start gap-3 rounded border p-3 ${styles[sev]}`}>
                <div>
                  <div className={`text-[10px] font-bold mb-0.5 ${sev === "RED" ? "text-red-400" : sev === "YELLOW" ? "text-yellow-400" : "text-green-400"}`}>
                    {c.type.replace(/_/g, " ")} · {sev}
                  </div>
                  <div className="text-xs">{c.message}</div>
                  {c.department && (
                    <div className={`inline-block text-[9px] px-1.5 py-0.5 rounded mt-1 ${DEPT_BG[c.department] ?? "bg-gray-500/20 text-gray-300"}`}>
                      {c.department}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekly coverage matrix */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-[#e8eaf6]">Weekly Department Coverage Matrix</div>
          <div className="flex gap-1">
            {SHIFT_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2 py-1 rounded text-[10px] ${selectedDay === d ? "bg-[#4f8ef7] text-white" : "bg-[#22263a] text-[#8892b0] hover:text-[#e8eaf6]"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2e3250]">
                <th className="text-left py-2 text-[#8892b0] font-medium">Department</th>
                <th className="text-center py-2 text-[#8892b0] font-medium">Required</th>
                <th className="text-center py-2 text-[#8892b0] font-medium">Scheduled</th>
                <th className="text-center py-2 text-[#8892b0] font-medium">Gap</th>
                <th className="text-center py-2 text-[#8892b0] font-medium">Status</th>
                <th className="text-left py-2 text-[#8892b0] font-medium pl-4">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(DEPT_REQUIRED).map((dept) => {
                const req = DEPT_REQUIRED[dept as Department]?.[selectedDay] ?? 0;
                const sched = DEPT_SCHEDULED[dept as Department]?.[selectedDay] ?? 0;
                const pct = pressure(sched, req);
                const gap = req - sched;
                const { label, badge } = statusLabel(pct, req, sched);
                return (
                  <tr key={dept} className="border-b border-[#2e3250]/50">
                    <td className="py-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${DEPT_BG[dept as Department] ?? "bg-gray-500/20 text-gray-300"}`}>
                        {dept}
                      </span>
                    </td>
                    <td className="py-2 text-center text-[#e8eaf6]">{req}</td>
                    <td className="py-2 text-center text-[#e8eaf6]">{sched}</td>
                    <td className={`py-2 text-center font-bold ${gap > 0 ? "text-red-400" : "text-green-400"}`}>
                      {gap > 0 ? `−${gap}` : "OK"}
                    </td>
                    <td className="py-2 text-center">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${badge}`}>{label}</span>
                    </td>
                    <td className="py-2 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#22263a] rounded-full overflow-hidden w-24">
                          <div
                            className={`h-full rounded-full ${sched >= req ? "bg-green-500" : pct >= 85 ? "bg-yellow-400" : "bg-red-500"}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] ${statusColor(pct, req, sched)}`}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Float Team Roster */}
        <Card>
          <div className="text-sm font-semibold text-[#e8eaf6] mb-3">Float Team Deployment Roster</div>
          <div className="space-y-3">
            {floatStaff.map((s) => {
              const pct = Math.round((s.hoursThisWeek / s.maxHours) * 100);
              const remainingHours = s.maxHours - s.hoursThisWeek;
              return (
                <div key={s.id} className={`rounded border p-3 ${s.available ? "border-[#2e3250]" : "border-red-500/30 opacity-70"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#e8eaf6]">{s.name}</div>
                      <div className="text-[10px] text-[#8892b0]">{s.role}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.available ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {s.available ? "AVAILABLE" : "UNAVAILABLE"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[9px]">
                    <span className={DEPT_BG[s.primaryDepartment] ?? "bg-gray-500/20 text-gray-300"}>
                      Primary: {s.primaryDepartment}
                    </span>
                    {s.secondaryDepartment && (
                      <span className={DEPT_BG[s.secondaryDepartment] ?? "bg-gray-500/20 text-gray-300"}>
                        Secondary: {s.secondaryDepartment}
                      </span>
                    )}
                    {s.emergencyRole && (
                      <span className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">
                        Emergency: {s.emergencyRole}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1 text-[10px] text-[#8892b0]">
                      <span>Hours: {s.hoursThisWeek}/{s.maxHours} ({remainingHours}h remaining)</span>
                      <span className={pct >= 90 ? "text-red-400" : pct >= 75 ? "text-yellow-400" : "text-green-400"}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#22263a] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 75 ? "bg-yellow-400" : "bg-blue-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {s.certifications.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {s.certifications.map((c) => (
                        <span key={c} className="text-[9px] bg-[#4f8ef7]/10 text-[#4f8ef7] px-1.5 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* All Staff Load */}
        <Card>
          <div className="text-sm font-semibold text-[#e8eaf6] mb-3">Staff Hours Load</div>
          <div className="space-y-2">
            {STAFF.map((s) => {
              const pct = Math.round((s.hoursThisWeek / s.maxHours) * 100);
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <div className="text-[10px] font-medium text-[#e8eaf6] truncate">{s.name}</div>
                    <div className="text-[9px] text-[#8892b0]">{s.hoursThisWeek}h / {s.maxHours}h</div>
                  </div>
                  <div className="flex-1 h-1.5 bg-[#22263a] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        !s.available
                          ? "bg-gray-500"
                          : pct >= 100
                          ? "bg-red-500"
                          : pct >= 90
                          ? "bg-red-400"
                          : pct >= 80
                          ? "bg-yellow-400"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!s.available && <span className="text-[9px] text-gray-500">Off</span>}
                    {pct >= 100 && s.available && <span className="text-[9px] text-red-400 font-bold">MAX</span>}
                    {s.isFloat && <span className="text-[9px] text-purple-400">Float</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

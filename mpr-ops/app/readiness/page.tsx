"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { READINESS, DEPT_BG } from "@/lib/data";
import type { DepartmentReadiness } from "@/lib/types";

function ReadinessScore({ items }: { items: DepartmentReadiness["items"] }) {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const critDone = items.filter((i) => i.critical && i.done).length;
  const critTotal = items.filter((i) => i.critical).length;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-4">
      <div>
        <div className={`text-2xl font-bold ${pct >= 90 ? "text-green-400" : pct >= 70 ? "text-yellow-400" : "text-red-400"}`}>
          {pct}%
        </div>
        <div className="text-[10px] text-[#8892b0]">{done}/{total} complete</div>
      </div>
      <div>
        <div className={`text-lg font-bold ${critDone === critTotal ? "text-green-400" : "text-red-400"}`}>
          {critDone}/{critTotal}
        </div>
        <div className="text-[10px] text-[#8892b0]">Critical items</div>
      </div>
    </div>
  );
}

export default function ReadinessPage() {
  const [selected, setSelected] = useState<DepartmentReadiness>(READINESS[0]);
  const [items, setItems] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    READINESS.forEach((r) => r.items.forEach((i) => { map[i.id] = i.done; }));
    return map;
  });

  const overallScore = (() => {
    const all = READINESS.flatMap((r) => r.items);
    const done = all.filter((i) => items[i.id]).length;
    return Math.round((done / all.length) * 100);
  })();

  const criticalGaps = READINESS.filter((r) =>
    r.items.some((i) => i.critical && !items[i.id])
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e8eaf6]">Operational Readiness</h1>
          <p className="text-sm text-[#8892b0] mt-0.5">
            Department shift checklists · AM / PM / Overnight
          </p>
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold ${overallScore >= 90 ? "text-green-400" : overallScore >= 70 ? "text-yellow-400" : "text-red-400"}`}>
            {overallScore}%
          </div>
          <div className="text-xs text-[#8892b0]">Resort Readiness Score</div>
        </div>
      </div>

      {/* Automation Rule 2 banner */}
      {criticalGaps.some((r) => r.department === "Housekeeping") && (
        <div className="rounded-lg border border-red-500/60 bg-red-500/10 p-3 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div className="text-xs text-[#e8eaf6]">
            <span className="font-bold text-red-400">[AUTOMATION RULE 2 TRIGGERED]</span> Housekeeping
            critical checklist incomplete + arrival window within 2 hours. Escalation level: RED.
          </div>
        </div>
      )}

      {/* Department grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {READINESS.map((r) => {
          const done = r.items.filter((i) => items[i.id]).length;
          const pct = Math.round((done / r.items.length) * 100);
          const hasCritGap = r.items.some((i) => i.critical && !items[i.id]);
          const isActive = selected.department === r.department;
          return (
            <div
              key={r.department}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                isActive
                  ? "border-[#4f8ef7]/60 bg-[#4f8ef7]/5"
                  : hasCritGap
                  ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60"
                  : pct >= 90
                  ? "border-green-500/30 bg-green-500/5 hover:border-green-500/50"
                  : "border-[#2e3250] bg-[#1a1d27] hover:border-[#4f8ef7]/30"
              }`}
              onClick={() => setSelected(r)}
            >
              <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded inline-block mb-2 ${DEPT_BG[r.department] ?? "bg-gray-500/20 text-gray-300"}`}>
                {r.department}
              </div>
              <div className={`text-xl font-bold ${pct >= 90 ? "text-green-400" : pct >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                {pct}%
              </div>
              <div className="text-[10px] text-[#8892b0]">{done}/{r.items.length} done</div>
              {hasCritGap && <div className="text-[9px] text-red-400 font-bold mt-1">CRIT GAP</div>}
              {!r.submittedBy && (
                <div className="text-[9px] text-yellow-400 mt-0.5">Not submitted</div>
              )}
              <div className="mt-2 w-full h-1 bg-[#22263a] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 90 ? "bg-green-500" : pct >= 70 ? "bg-yellow-400" : "bg-red-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-[#e8eaf6]">{selected.department}</div>
              <div className="text-[10px] text-[#8892b0]">
                {selected.shift} Shift · {selected.date}
              </div>
            </div>
            <ReadinessScore items={selected.items.map((i) => ({ ...i, done: items[i.id] }))} />
          </div>

          {selected.submittedBy ? (
            <div className="text-[10px] text-green-400 mb-3">
              ✓ Submitted by {selected.submittedBy} at{" "}
              {new Date(selected.submittedAt!).toLocaleTimeString("en-CA", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          ) : (
            <div className="text-[10px] text-yellow-400 mb-3">⚠ Checklist not yet submitted</div>
          )}

          <div className="space-y-2">
            {selected.items.map((item) => {
              const done = items[item.id];
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-2.5 rounded border cursor-pointer transition-colors ${
                    done
                      ? "border-green-500/30 bg-green-500/5"
                      : item.critical
                      ? "border-red-500/40 bg-red-500/5 hover:bg-red-500/10"
                      : "border-[#2e3250] hover:bg-[#22263a]"
                  }`}
                  onClick={() => setItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                >
                  <div
                    className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                      done
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-[#2e3250] text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className={`text-xs ${done ? "text-[#8892b0] line-through" : "text-[#e8eaf6]"}`}>
                      {item.label}
                    </div>
                    {item.critical && (
                      <span className="text-[9px] text-red-400 font-medium">Critical</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Critical gaps summary */}
        <Card>
          <div className="text-sm font-semibold text-[#e8eaf6] mb-3">Resort-Wide Critical Gaps</div>
          {criticalGaps.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm text-green-400 font-medium">All critical items complete</div>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalGaps.map((r) => {
                const gaps = r.items.filter((i) => i.critical && !items[i.id]);
                return (
                  <div key={r.department} className="rounded border border-red-500/40 bg-red-500/5 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${DEPT_BG[r.department] ?? "bg-gray-500/20 text-gray-300"}`}>
                        {r.department}
                      </span>
                      <span className="text-[10px] text-red-400 font-bold">
                        {gaps.length} critical gap{gaps.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {gaps.map((g) => (
                        <li key={g.id} className="text-xs text-[#e8eaf6] flex items-center gap-1.5">
                          <span className="text-red-400 shrink-0">✗</span>
                          {g.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Automation reminder */}
          <div className="mt-4 border-t border-[#2e3250] pt-4">
            <div className="text-[10px] font-semibold text-[#8892b0] uppercase mb-2">
              Automation Rules
            </div>
            <div className="space-y-1.5 text-[10px] text-[#8892b0]">
              <div>
                <span className="text-yellow-400 font-bold">Rule 2:</span> IF housekeeping delay AND
                arrivals &lt;2hrs → Escalation RED
              </div>
              <div>
                <span className="text-red-400 font-bold">Rule 3:</span> IF severity HIGH → Exec
                notification + incident command
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

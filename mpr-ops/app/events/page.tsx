"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { BEO_EVENTS, STAFF, DEPT_COLORS, DEPT_BG } from "@/lib/data";
import type { BEOEvent, Department } from "@/lib/types";

const STATUS_COLOR: Record<BEOEvent["status"], string> = {
  "Confirmed": "bg-blue-500/20 text-blue-300",
  "Tentative": "bg-yellow-500/20 text-yellow-300",
  "In Progress": "bg-orange-500/20 text-orange-300",
  "Complete": "bg-green-500/20 text-green-300",
};

const RISK_COLOR = {
  LOW: "bg-green-500/20 text-green-300",
  MED: "bg-yellow-500/20 text-yellow-300",
  HIGH: "bg-red-500/20 text-red-300",
};

function StaffingEngine({ event }: { event: BEOEvent }) {
  const assigned = event.assignedStaff.length;
  const required = event.requiredStaff.reduce((s, r) => s + r.count, 0);
  const gap = required - assigned;

  return (
    <div className="mt-3 border-t border-[#2e3250] pt-3">
      <div className="text-[10px] font-semibold text-[#8892b0] uppercase mb-2">
        Staffing Requirement Engine
      </div>
      <div className="flex gap-4 mb-2">
        <div>
          <div className="text-lg font-bold text-[#e8eaf6]">{assigned}/{required}</div>
          <div className="text-[10px] text-[#8892b0]">Staff Assigned</div>
        </div>
        {gap > 0 && (
          <div>
            <div className="text-lg font-bold text-red-400">−{gap}</div>
            <div className="text-[10px] text-[#8892b0]">Gap</div>
          </div>
        )}
        <div>
          <div className="text-lg font-bold text-green-400">
            ${event.revenueEstimate.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#8892b0]">Revenue Est.</div>
        </div>
        <div>
          <div className="text-lg font-bold text-orange-400">
            ${event.laborCostEstimate.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#8892b0]">Labor Cost Est.</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {event.requiredStaff.map((r) => (
          <div
            key={r.department}
            className={`text-[10px] px-2 py-0.5 rounded ${
              DEPT_BG[r.department as Department] ?? "bg-gray-500/20 text-gray-300"
            }`}
          >
            {r.department}: {r.count}
          </div>
        ))}
      </div>
      {event.avRequired && (
        <div className="mt-1.5 text-[10px] text-gray-300 bg-gray-500/10 rounded px-2 py-1 inline-block">
          AV/IT Required
        </div>
      )}
    </div>
  );
}

function GanttRow({ event }: { event: BEOEvent }) {
  const startH = parseInt(event.startTime.split(":")[0]);
  const endH = parseInt(event.endTime.split(":")[0]);
  const startPct = ((startH - 6) / 18) * 100;
  const widthPct = ((endH - startH) / 18) * 100;
  const color = DEPT_COLORS["F&B"];

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-40 shrink-0 text-xs text-[#8892b0] truncate">{event.name}</div>
      <div className="flex-1 relative h-6 bg-[#22263a] rounded">
        <div
          className="absolute top-1 h-4 rounded text-[10px] flex items-center px-1 text-white font-medium overflow-hidden"
          style={{
            left: `${startPct}%`,
            width: `${widthPct}%`,
            backgroundColor: color + "99",
            borderLeft: `2px solid ${color}`,
          }}
        >
          {event.venue}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [selected, setSelected] = useState<BEOEvent | null>(BEO_EVENTS[1]);
  const hours = Array.from({ length: 19 }, (_, i) => i + 6);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#e8eaf6]">Unified Event Matrix</h1>
        <p className="text-sm text-[#8892b0] mt-0.5">
          BEO-linked execution · Gantt timeline · Staffing engine
        </p>
      </div>

      {/* Gantt Timeline */}
      <Card>
        <div className="text-sm font-semibold text-[#e8eaf6] mb-3">
          Gantt Timeline — Week of May 19
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-40 shrink-0" />
          <div className="flex-1 flex">
            {hours.filter((h) => h % 2 === 0).map((h) => (
              <div key={h} className="flex-1 text-[10px] text-[#8892b0]">
                {h}:00
              </div>
            ))}
          </div>
        </div>
        {BEO_EVENTS.map((ev) => (
          <div
            key={ev.id}
            className={`cursor-pointer rounded transition-colors ${selected?.id === ev.id ? "bg-[#22263a]" : "hover:bg-[#22263a]/50"}`}
            onClick={() => setSelected(ev)}
          >
            <GanttRow event={ev} />
          </div>
        ))}
      </Card>

      {/* Event List + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* List */}
        <div className="xl:col-span-2 space-y-2">
          {BEO_EVENTS.map((ev) => (
            <div
              key={ev.id}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                selected?.id === ev.id
                  ? "border-[#4f8ef7]/50 bg-[#4f8ef7]/5"
                  : "border-[#2e3250] bg-[#1a1d27] hover:border-[#4f8ef7]/30"
              }`}
              onClick={() => setSelected(ev)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-[#e8eaf6]">{ev.name}</div>
                  <div className="text-[10px] text-[#8892b0] mt-0.5">
                    {ev.beoNumber} · {ev.date}
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_COLOR[ev.status]}`}>
                  {ev.status}
                </span>
              </div>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] text-[#8892b0]">
                  {ev.venue} · {ev.guestCount} guests
                </span>
                <span className={`text-[10px] px-1 rounded ${RISK_COLOR[ev.riskLevel]}`}>
                  Risk: {ev.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <Card className="xl:col-span-3">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#e8eaf6]">{selected.name}</h2>
                <div className="text-xs text-[#8892b0] mt-0.5">
                  {selected.beoNumber} · {selected.venue} · {selected.date} · {selected.startTime}–{selected.endTime}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                <span className={`text-[10px] px-2 py-0.5 rounded ${STATUS_COLOR[selected.status]}`}>
                  {selected.status}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${RISK_COLOR[selected.riskLevel]}`}>
                  Risk: {selected.riskLevel}
                </span>
              </div>
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Guests", value: selected.guestCount },
                { label: "Setup", value: selected.setupStyle },
                { label: "Type", value: selected.type },
                { label: "AV", value: selected.avRequired ? "Required" : "Not needed" },
                { label: "Catering", value: selected.cateringRequired ? "Required" : "Not needed" },
                { label: "Revenue", value: `$${selected.revenueEstimate.toLocaleString()}` },
              ].map((f) => (
                <div key={f.label} className="bg-[#22263a] rounded p-2">
                  <div className="text-[10px] text-[#8892b0]">{f.label}</div>
                  <div className="text-xs text-[#e8eaf6] font-medium">{String(f.value)}</div>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mb-4">
                <div className="text-[10px] font-semibold text-yellow-400 mb-0.5">NOTES</div>
                <div className="text-xs text-[#e8eaf6]">{selected.notes}</div>
              </div>
            )}

            {/* Milestones */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-[#8892b0] uppercase tracking-wider mb-2">
                Milestones
              </div>
              <div className="space-y-1.5">
                {selected.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                        m.done ? "bg-green-500/20 text-green-400" : "bg-[#22263a] text-[#8892b0]"
                      }`}
                    >
                      {m.done ? "✓" : "○"}
                    </span>
                    <span className={`text-xs flex-1 ${m.done ? "text-[#8892b0] line-through" : "text-[#e8eaf6]"}`}>
                      {m.label}
                    </span>
                    <span className="text-[10px] text-[#8892b0] shrink-0">{m.time}</span>
                    <span
                      className={`text-[10px] px-1 rounded shrink-0 ${
                        DEPT_BG[m.department as Department] ?? "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {m.department}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <StaffingEngine event={selected} />
          </Card>
        )}
      </div>
    </div>
  );
}

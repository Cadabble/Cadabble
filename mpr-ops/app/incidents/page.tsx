"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { INCIDENTS, DEPT_BG } from "@/lib/data";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/lib/types";

const SEV_COLOR: Record<IncidentSeverity, string> = {
  Critical: "border-red-500/60 bg-red-500/10",
  High: "border-orange-500/60 bg-orange-500/10",
  Medium: "border-yellow-500/60 bg-yellow-500/10",
  Low: "border-blue-500/60 bg-blue-500/10",
};

const SEV_TEXT: Record<IncidentSeverity, string> = {
  Critical: "text-red-400",
  High: "text-orange-400",
  Medium: "text-yellow-400",
  Low: "text-blue-400",
};

const STATUS_COLOR: Record<IncidentStatus, string> = {
  Open: "bg-red-500/20 text-red-300",
  "In Progress": "bg-orange-500/20 text-orange-300",
  Escalated: "bg-purple-500/20 text-purple-300",
  Resolved: "bg-green-500/20 text-green-300",
};

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export default function IncidentsPage() {
  const [selected, setSelected] = useState<Incident>(INCIDENTS[3]);
  const [filter, setFilter] = useState<"All" | IncidentSeverity | IncidentStatus>("All");

  const open = INCIDENTS.filter((i) => i.status !== "Resolved");
  const critical = INCIDENTS.filter((i) => i.severity === "Critical");
  const guestImpact = INCIDENTS.filter((i) => i.guestImpact && i.status !== "Resolved");
  const execEscalated = INCIDENTS.filter((i) => i.escalatedToExec);

  const filtered =
    filter === "All"
      ? INCIDENTS
      : INCIDENTS.filter((i) => i.severity === filter || i.status === filter);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e8eaf6]">Incident Command System</h1>
          <p className="text-sm text-[#8892b0] mt-0.5">
            Executive War Room · Centralized issue management · Escalation tracking
          </p>
        </div>
        <div className="flex gap-4">
          {[
            { label: "Open", value: open.length, color: "text-red-400" },
            { label: "Critical", value: critical.length, color: "text-red-500" },
            { label: "Guest Impact", value: guestImpact.length, color: "text-orange-400" },
            { label: "Exec Escalated", value: execEscalated.length, color: "text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[#8892b0]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical banner */}
      {critical.filter((i) => i.status !== "Resolved").length > 0 && (
        <div className="rounded-lg border border-red-500/60 bg-red-500/10 p-3 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div className="text-xs text-red-300">
            <span className="font-bold">CRITICAL INCIDENT ACTIVE:</span>{" "}
            {critical.filter((i) => i.status !== "Resolved").map((i) => i.title).join(" | ")}
          </div>
        </div>
      )}

      {/* Automation Rule 3 */}
      {execEscalated.length > 0 && (
        <div className="rounded-lg border border-purple-500/40 bg-purple-500/10 p-3 flex items-center gap-3">
          <span className="text-xs font-bold text-purple-400">[RULE 3]</span>
          <div className="text-xs text-[#e8eaf6]">
            High severity incident detected → Executive notification sent → Incident command escalated →
            Recovery action deployed.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* List */}
        <div className="xl:col-span-2 space-y-2">
          {/* Filters */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {["All", "Critical", "High", "Medium", "Low", "Open", "Escalated", "Resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-2 py-0.5 rounded text-[10px] ${filter === f ? "bg-[#4f8ef7] text-white" : "bg-[#22263a] text-[#8892b0] hover:text-[#e8eaf6]"}`}
              >
                {f}
              </button>
            ))}
          </div>
          {filtered.map((inc) => (
            <div
              key={inc.id}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                selected?.id === inc.id
                  ? "border-[#4f8ef7]/60 bg-[#4f8ef7]/5"
                  : `${SEV_COLOR[inc.severity]} hover:border-opacity-100`
              }`}
              onClick={() => setSelected(inc)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`text-xs font-semibold ${SEV_TEXT[inc.severity]}`}>
                  {inc.severity.toUpperCase()}
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_COLOR[inc.status]}`}>
                  {inc.status}
                </span>
              </div>
              <div className="text-xs text-[#e8eaf6] font-medium mt-1">{inc.title}</div>
              <div className="text-[10px] text-[#8892b0] mt-0.5 flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded ${DEPT_BG[inc.department] ?? "bg-gray-500/20 text-gray-300"}`}>
                  {inc.department}
                </span>
                <span>·</span>
                <span>{timeAgo(inc.reportedAt)}</span>
                {inc.guestImpact && <span className="text-orange-400">· Guest Impact</span>}
                {inc.escalatedToExec && <span className="text-red-400 font-bold">· EXEC</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <Card className="xl:col-span-3">
            {/* Header */}
            <div className={`rounded-lg border p-3 mb-4 ${SEV_COLOR[selected.severity]}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-xs font-bold ${SEV_TEXT[selected.severity]}`}>
                    SEVERITY: {selected.severity.toUpperCase()}
                  </div>
                  <div className="text-base font-bold text-[#e8eaf6] mt-1">{selected.title}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium shrink-0 ${STATUS_COLOR[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
                <span className={DEPT_BG[selected.department] ?? "bg-gray-500/20 text-gray-300"}>
                  {selected.department}
                </span>
                <span className="text-[#8892b0]">Reported by: {selected.reportedBy}</span>
                <span className="text-[#8892b0]">{new Date(selected.reportedAt).toLocaleString("en-CA")}</span>
                {selected.guestImpact && (
                  <span className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">
                    Guest Impact
                  </span>
                )}
                {selected.escalatedToExec && (
                  <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">
                    EXEC ESCALATED
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <div className="text-[10px] font-semibold text-[#8892b0] uppercase mb-1">Incident Description</div>
              <p className="text-xs text-[#e8eaf6] leading-relaxed">{selected.description}</p>
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#22263a] rounded p-2.5">
                <div className="text-[10px] text-[#8892b0] mb-1">Assigned To</div>
                <div className="text-xs font-medium text-[#e8eaf6]">
                  {selected.assignedTo ?? <span className="text-red-400">UNASSIGNED</span>}
                </div>
              </div>
              {selected.resolvedAt && (
                <div className="bg-[#22263a] rounded p-2.5">
                  <div className="text-[10px] text-[#8892b0] mb-1">Resolved At</div>
                  <div className="text-xs font-medium text-green-400">
                    {new Date(selected.resolvedAt).toLocaleString("en-CA")}
                  </div>
                </div>
              )}
              {selected.recoveryAction && (
                <div className="bg-[#22263a] rounded p-2.5 col-span-2">
                  <div className="text-[10px] text-[#8892b0] mb-1">Recovery Action</div>
                  <div className="text-xs text-[#e8eaf6]">{selected.recoveryAction}</div>
                </div>
              )}
            </div>

            {/* Timeline */}
            {selected.updates.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold text-[#8892b0] uppercase mb-2">
                  Response Timeline
                </div>
                <div className="space-y-2 border-l border-[#2e3250] pl-4">
                  {selected.updates.map((u, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[1.35rem] top-1 h-2 w-2 rounded-full bg-[#4f8ef7]" />
                      <div className="text-[10px] text-[#8892b0]">
                        {new Date(u.timestamp).toLocaleTimeString("en-CA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {u.author}
                      </div>
                      <div className="text-xs text-[#e8eaf6] mt-0.5">{u.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

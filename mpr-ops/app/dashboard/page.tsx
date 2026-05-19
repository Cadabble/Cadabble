"use client";

import { Card, KPICard } from "@/components/ui";
import {
  INCIDENTS,
  BEO_EVENTS,
  STAFF,
  READINESS,
  AUTOMATION_ALERTS,
  SHIFT_CONFLICTS,
  KPI_TARGETS,
  DEPT_BG,
} from "@/lib/data";

function AlertBanner({
  severity,
  message,
  time,
  ack,
}: {
  severity: "RED" | "YELLOW" | "GREEN";
  message: string;
  time: string;
  ack: boolean;
}) {
  const styles = {
    RED: "border-red-500/50 bg-red-500/10",
    YELLOW: "border-yellow-500/50 bg-yellow-500/10",
    GREEN: "border-green-500/50 bg-green-500/10",
  };
  const dot = { RED: "bg-red-500", YELLOW: "bg-yellow-400", GREEN: "bg-green-400" };
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${styles[severity]} ${ack ? "opacity-50" : ""}`}>
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dot[severity]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#e8eaf6]">{message}</p>
        <p className="text-[10px] text-[#8892b0] mt-0.5">{time}{ack ? " · Acknowledged" : ""}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const openIncidents = INCIDENTS.filter((i) => i.status !== "Resolved");
  const criticalIncidents = INCIDENTS.filter((i) => i.severity === "Critical" && i.status !== "Resolved");
  const todayEvents = BEO_EVENTS.filter((e) => e.status === "In Progress" || e.status === "Confirmed");
  const availableFloat = STAFF.filter((s) => s.isFloat && s.available);
  const staffingPressure = Math.round(
    (STAFF.filter((s) => !s.available).length / STAFF.length) * 100
  );

  const readinessScore = (() => {
    const all = READINESS.flatMap((r) => r.items);
    const done = all.filter((i) => i.done).length;
    return Math.round((done / all.length) * 100);
  })();

  const deptStatus = READINESS.map((r) => {
    const critical = r.items.filter((i) => i.critical);
    const critDone = critical.filter((i) => i.done).length;
    const allDone = r.items.filter((i) => i.done).length;
    const score = Math.round((allDone / r.items.length) * 100);
    const hasCritGap = critical.some((i) => !i.done);
    return {
      dept: r.department,
      score,
      submitted: !!r.submittedBy,
      hasCritGap,
      critDone,
      critTotal: critical.length,
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e8eaf6]">Resort Operations Command Center</h1>
          <p className="text-sm text-[#8892b0] mt-0.5">Manning Park Resort · Executive War Room · 2026-05-19</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Automation Alerts */}
      {AUTOMATION_ALERTS.filter((a) => !a.acknowledged).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#8892b0] uppercase tracking-wider">
            Active Automation Alerts
          </div>
          {AUTOMATION_ALERTS.filter((a) => !a.acknowledged).map((a) => (
            <AlertBanner
              key={a.id}
              severity={a.severity}
              message={`[Rule ${a.rule}] ${a.message}`}
              time={new Date(a.triggeredAt).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
              ack={a.acknowledged}
            />
          ))}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard
          label="Event Readiness"
          value={KPI_TARGETS.eventReadiness.current}
          target={KPI_TARGETS.eventReadiness.target}
          unit="%"
        />
        <KPICard
          label="Staffing Coverage"
          value={KPI_TARGETS.staffingCoverage.current}
          target={KPI_TARGETS.staffingCoverage.target}
          unit="%"
        />
        <KPICard
          label="Guest Satisfaction"
          value={KPI_TARGETS.guestSatisfaction.current}
          target={KPI_TARGETS.guestSatisfaction.target}
          unit="%"
        />
        <KPICard
          label="Incident Resolution"
          value={KPI_TARGETS.incidentResolution.current}
          target={KPI_TARGETS.incidentResolution.target}
          unit="min"
          lowerIsBetter
        />
        <KPICard
          label="Float Efficiency"
          value={KPI_TARGETS.floatEfficiency.current}
          target={KPI_TARGETS.floatEfficiency.target}
          unit="%"
        />
        <KPICard
          label="Op Downtime"
          value={KPI_TARGETS.operationalDowntime.current}
          target={KPI_TARGETS.operationalDowntime.target}
          unit="%"
          lowerIsBetter
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Shift Conflicts */}
        <Card className="xl:col-span-2">
          <div className="text-sm font-semibold text-[#e8eaf6] mb-3">Shift Conflict Detector</div>
          <div className="space-y-2">
            {SHIFT_CONFLICTS.map((c, i) => {
              const color = c.severity === "RED" ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
              return (
                <div key={i} className={`flex items-start gap-3 rounded border p-2.5 ${color}`}>
                  <span className="text-xs font-bold shrink-0 mt-0.5">{c.severity}</span>
                  <span className="text-xs">{c.message}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Float Pool */}
        <Card>
          <div className="text-sm font-semibold text-[#e8eaf6] mb-3">Float Pool</div>
          <div className="space-y-2">
            {STAFF.filter((s) => s.floatEligible).map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[#e8eaf6]">{s.name}</div>
                  <div className="text-[10px] text-[#8892b0]">{s.primaryDepartment}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8892b0]">
                    {s.hoursThisWeek}/{s.maxHours}h
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      s.available
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {s.available ? "AVAIL" : "BUSY"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Incidents */}
        <Card>
          <div className="text-sm font-semibold text-[#e8eaf6] mb-3">
            Active Incidents
            <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
              {openIncidents.length} open
            </span>
          </div>
          <div className="space-y-2">
            {openIncidents.map((inc) => {
              const sev = {
                Critical: "text-red-400",
                High: "text-orange-400",
                Medium: "text-yellow-400",
                Low: "text-blue-400",
              }[inc.severity];
              return (
                <div key={inc.id} className="border-b border-[#2e3250] pb-2 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-[#e8eaf6] leading-tight">{inc.title}</span>
                    <span className={`text-[10px] font-bold shrink-0 ${sev}`}>{inc.severity.toUpperCase()}</span>
                  </div>
                  <div className="text-[10px] text-[#8892b0] mt-0.5">
                    {inc.department} · {inc.status}
                    {inc.guestImpact && <span className="ml-1 text-orange-400">· Guest Impact</span>}
                    {inc.escalatedToExec && <span className="ml-1 text-red-400">· EXEC</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Today's Events */}
        <Card>
          <div className="text-sm font-semibold text-[#e8eaf6] mb-3">
            Events Active / Upcoming
            <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
              {todayEvents.length}
            </span>
          </div>
          <div className="space-y-3">
            {todayEvents.map((ev) => {
              const done = ev.milestones.filter((m) => m.done).length;
              const pct = Math.round((done / ev.milestones.length) * 100);
              return (
                <div key={ev.id} className="border-b border-[#2e3250] pb-2 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-medium text-[#e8eaf6]">{ev.name}</div>
                    <span
                      className={`text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded ${
                        ev.riskLevel === "HIGH"
                          ? "bg-red-500/20 text-red-400"
                          : ev.riskLevel === "MED"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {ev.riskLevel}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8892b0] mt-0.5">
                    {ev.venue} · {ev.startTime}–{ev.endTime} · {ev.guestCount} guests
                  </div>
                  <div className="mt-1.5 w-full h-1 bg-[#22263a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#8892b0] mt-0.5">{pct}% milestones complete</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Department Readiness */}
        <Card>
          <div className="text-sm font-semibold text-[#e8eaf6] mb-3">
            Department Readiness
            <span className="ml-2 text-xs bg-[#22263a] text-[#8892b0] px-1.5 py-0.5 rounded">
              {readinessScore}% overall
            </span>
          </div>
          <div className="space-y-2">
            {deptStatus.map((d) => (
              <div key={d.dept}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded text-[10px] font-medium ${DEPT_BG[d.dept as keyof typeof DEPT_BG] ?? "bg-gray-500/20 text-gray-300"}`}>
                    {d.dept}
                  </span>
                  <div className="flex items-center gap-2">
                    {d.hasCritGap && <span className="text-[10px] text-red-400 font-bold">CRIT GAP</span>}
                    {!d.submitted && <span className="text-[10px] text-yellow-400">NOT SUBMITTED</span>}
                    <span className="text-xs text-[#8892b0]">{d.score}%</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-[#22263a] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.score >= 90 ? "bg-green-500" : d.score >= 70 ? "bg-yellow-400" : "bg-red-500"}`}
                    style={{ width: `${d.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Phase roadmap */}
      <Card>
        <div className="text-sm font-semibold text-[#e8eaf6] mb-3">System Evolution Roadmap</div>
        <div className="flex gap-0 flex-wrap">
          {[
            { phase: "Phase 1", label: "Excel Operational System", done: true, current: false },
            { phase: "Phase 2", label: "SharePoint + Teams Integration", done: false, current: true },
            { phase: "Phase 3", label: "Power BI Dashboards", done: false, current: false },
            { phase: "Phase 4", label: "AI Operational Prediction", done: false, current: false },
            { phase: "Phase 5", label: "Cadabble Resort OS", done: false, current: false },
          ].map((p, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`flex flex-col items-center px-4 py-2 rounded ${
                  p.current
                    ? "bg-[#4f8ef7]/20 border border-[#4f8ef7]/50"
                    : p.done
                    ? "bg-green-500/10"
                    : "opacity-40"
                }`}
              >
                <span className="text-[10px] text-[#8892b0]">{p.phase}</span>
                <span className="text-xs text-[#e8eaf6] text-center max-w-24">{p.label}</span>
                {p.done && <span className="text-[10px] text-green-400 mt-0.5">✓ Complete</span>}
                {p.current && <span className="text-[10px] text-[#4f8ef7] mt-0.5">← Active</span>}
              </div>
              {i < 4 && <div className="w-4 h-px bg-[#2e3250] mx-1" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

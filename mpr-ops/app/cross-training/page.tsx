"use client";

import { useState } from "react";
import { STAFF, SKILLS, DEPT_BG } from "@/lib/data";
import type { Department, SkillScore } from "@/lib/types";
import { SKILL_LABELS } from "@/lib/types";

const SCORE_COLORS: Record<SkillScore, string> = {
  0: "bg-[#22263a] text-[#8892b0]",
  1: "bg-purple-900/60 text-purple-300",
  2: "bg-blue-900/60 text-blue-300",
  3: "bg-sky-700/60 text-sky-200",
  4: "bg-green-800/60 text-green-300",
  5: "bg-green-500/30 text-green-200 font-bold",
};

const DEPARTMENTS: Department[] = [
  "Front Desk", "F&B", "Housekeeping", "Maintenance",
  "Activities", "Security", "Kitchen", "Ski Operations",
];

export default function CrossTrainingPage() {
  const [filterDept, setFilterDept] = useState<Department | "All">("All");
  const [hovered, setHovered] = useState<{ staffId: string; skillId: string } | null>(null);

  const filteredSkills = filterDept === "All"
    ? SKILLS
    : SKILLS.filter((s) => s.department === filterDept);

  const floatCount = STAFF.filter((s) => s.floatEligible).length;
  const avgScore = (() => {
    const vals: number[] = [];
    STAFF.forEach((s) => Object.values(s.skills).forEach((v) => vals.push(v)));
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  })();

  return (
    <div className="p-6 space-y-6 max-w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e8eaf6]">Cross-Training Matrix</h1>
          <p className="text-sm text-[#8892b0] mt-0.5">
            Operational workforce flexibility · Skill scores 0–5
          </p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-[#4f8ef7]">{STAFF.length}</div>
            <div className="text-[10px] text-[#8892b0]">Total Staff</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-400">{floatCount}</div>
            <div className="text-[10px] text-[#8892b0]">Float Eligible</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">{avgScore}</div>
            <div className="text-[10px] text-[#8892b0]">Avg Skill Score</div>
          </div>
        </div>
      </div>

      {/* Score Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(SKILL_LABELS) as [string, string][]).map(([score, label]) => (
          <div
            key={score}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] ${SCORE_COLORS[Number(score) as SkillScore]}`}
          >
            <span className="font-bold">{score}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Department filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterDept("All")}
          className={`px-3 py-1 rounded text-xs ${filterDept === "All" ? "bg-[#4f8ef7] text-white" : "bg-[#22263a] text-[#8892b0] hover:text-[#e8eaf6]"}`}
        >
          All Skills
        </button>
        {DEPARTMENTS.map((d) => (
          <button
            key={d}
            onClick={() => setFilterDept(d)}
            className={`px-3 py-1 rounded text-xs ${filterDept === d ? "bg-[#4f8ef7] text-white" : "bg-[#22263a] text-[#8892b0] hover:text-[#e8eaf6]"}`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto rounded-lg border border-[#2e3250]">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-[#1a1d27]">
              <th className="text-left px-3 py-2 font-semibold text-[#8892b0] min-w-36 sticky left-0 bg-[#1a1d27] z-10 border-r border-[#2e3250]">
                Staff Member
              </th>
              <th className="px-2 py-2 font-semibold text-[#8892b0] whitespace-nowrap text-center border-r border-[#2e3250]">
                Dept
              </th>
              <th className="px-2 py-2 font-semibold text-[#8892b0] whitespace-nowrap text-center border-r border-[#2e3250]">
                Level
              </th>
              <th className="px-2 py-2 font-semibold text-[#8892b0] whitespace-nowrap text-center border-r border-[#2e3250]">
                Float
              </th>
              {filteredSkills.map((s) => (
                <th
                  key={s.id}
                  className="px-1 py-2 font-medium text-[#8892b0] whitespace-nowrap text-center border-r border-[#2e3250] max-w-20"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] leading-tight text-center">{s.name}</span>
                    {s.critical && <span className="text-red-400 text-[8px]">★</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STAFF.map((staff, si) => (
              <tr
                key={staff.id}
                className={si % 2 === 0 ? "bg-[#0f1117]" : "bg-[#1a1d27]"}
              >
                <td className={`px-3 py-2 sticky left-0 border-r border-[#2e3250] z-10 ${si % 2 === 0 ? "bg-[#0f1117]" : "bg-[#1a1d27]"}`}>
                  <div className="font-medium text-[#e8eaf6]">{staff.name}</div>
                  <div className="text-[10px] text-[#8892b0]">{staff.role}</div>
                  {staff.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {staff.certifications.map((c) => (
                        <span key={c} className="text-[8px] bg-[#4f8ef7]/10 text-[#4f8ef7] px-1 rounded">
                          {c.split(" ").slice(-1)[0]}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 text-center border-r border-[#2e3250]">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${DEPT_BG[staff.primaryDepartment] ?? "bg-gray-500/20 text-gray-300"}`}>
                    {staff.primaryDepartment.split(" ")[0]}
                  </span>
                  {staff.secondaryDepartment && (
                    <div className="mt-0.5">
                      <span className={`text-[8px] px-1 py-0.5 rounded opacity-70 ${DEPT_BG[staff.secondaryDepartment] ?? "bg-gray-500/20 text-gray-300"}`}>
                        {staff.secondaryDepartment.split(" ")[0]}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 text-center border-r border-[#2e3250]">
                  <span className="text-[9px] text-[#8892b0]">{staff.leadershipLevel}</span>
                </td>
                <td className="px-2 py-2 text-center border-r border-[#2e3250]">
                  {staff.floatEligible ? (
                    <span className="text-[9px] text-green-400 font-bold">YES</span>
                  ) : (
                    <span className="text-[9px] text-[#8892b0]">—</span>
                  )}
                </td>
                {filteredSkills.map((skill) => {
                  const score = (staff.skills[skill.id] ?? 0) as SkillScore;
                  const isHovered =
                    hovered?.staffId === staff.id && hovered?.skillId === skill.id;
                  return (
                    <td
                      key={skill.id}
                      className="px-1 py-2 text-center border-r border-[#2e3250] cursor-default relative"
                      onMouseEnter={() => setHovered({ staffId: staff.id, skillId: skill.id })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div
                        className={`mx-auto w-6 h-6 rounded flex items-center justify-center text-[10px] ${SCORE_COLORS[score]}`}
                      >
                        {score === 0 ? "—" : score}
                      </div>
                      {isHovered && score > 0 && (
                        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#22263a] border border-[#2e3250] rounded px-2 py-1 text-[10px] text-[#e8eaf6] whitespace-nowrap">
                          {SKILL_LABELS[score]}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Coverage gaps */}
      <div className="rounded-lg border border-[#2e3250] bg-[#1a1d27] p-4">
        <div className="text-sm font-semibold text-[#e8eaf6] mb-3">Critical Skill Coverage Analysis</div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {SKILLS.filter((s) => s.critical).map((skill) => {
            const qualified = STAFF.filter(
              (st) => (st.skills[skill.id] ?? 0) >= 3
            );
            const leads = STAFF.filter((st) => (st.skills[skill.id] ?? 0) >= 4);
            const risk = qualified.length < 2 ? "HIGH" : qualified.length < 3 ? "MED" : "LOW";
            return (
              <div
                key={skill.id}
                className={`rounded p-2.5 border ${
                  risk === "HIGH"
                    ? "border-red-500/40 bg-red-500/5"
                    : risk === "MED"
                    ? "border-yellow-500/40 bg-yellow-500/5"
                    : "border-[#2e3250] bg-[#22263a]"
                }`}
              >
                <div className="text-xs font-medium text-[#e8eaf6] mb-1">{skill.name}</div>
                <div className="text-[10px] text-[#8892b0] mb-1">
                  <span className={DEPT_BG[skill.department] ?? "text-gray-300"}>
                    {skill.department}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm font-bold text-[#e8eaf6]">{qualified.length}</div>
                    <div className="text-[9px] text-[#8892b0]">Qualified (3+)</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-purple-400">{leads.length}</div>
                    <div className="text-[9px] text-[#8892b0]">Leads (4+)</div>
                  </div>
                  <div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      risk === "HIGH" ? "bg-red-500/20 text-red-400" :
                      risk === "MED" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {risk}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

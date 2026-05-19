export type Department =
  | "Front Desk"
  | "F&B"
  | "Housekeeping"
  | "Maintenance"
  | "Activities"
  | "Security"
  | "Kitchen"
  | "Ski Operations"
  | "Sales"
  | "AV/IT";

// 0=None, 1=Shadowed, 2=Assisted, 3=Independent, 4=Lead Capable, 5=Trainer
export type SkillScore = 0 | 1 | 2 | 3 | 4 | 5;

export const SKILL_LABELS: Record<SkillScore, string> = {
  0: "None",
  1: "Shadowed",
  2: "Assisted",
  3: "Independent",
  4: "Lead Capable",
  5: "Trainer",
};

export type Skill = {
  id: string;
  name: string;
  department: Department;
  critical: boolean;
  certification?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  primaryDepartment: Department;
  secondaryDepartment?: Department;
  emergencyRole?: string;
  role: string;
  leadershipLevel: "Team Member" | "Supervisor" | "Manager" | "Director";
  skills: Record<string, SkillScore>;
  hoursThisWeek: number;
  maxHours: number;
  available: boolean;
  isFloat: boolean;
  floatEligible: boolean;
  phone: string;
  certifications: string[];
  laborRate: number;
};

export type Shift = {
  id: string;
  staffId: string;
  department: Department;
  date: string;
  start: string;
  end: string;
  role: string;
};

export type ShiftConflict = {
  type: "DOUBLE_ASSIGNED" | "OVERTIME" | "STAFFING_GAP" | "NO_FLOAT" | "OVERLOAD";
  severity: "RED" | "YELLOW" | "GREEN";
  message: string;
  department?: Department;
  staffId?: string;
};

export type BEOEvent = {
  id: string;
  name: string;
  type: "Wedding" | "Corporate" | "Group" | "Conference" | "Private";
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  venue: string;
  setupStyle: string;
  avRequired: boolean;
  cateringRequired: boolean;
  riskLevel: "LOW" | "MED" | "HIGH";
  status: "Confirmed" | "Tentative" | "In Progress" | "Complete";
  requiredStaff: { department: Department; count: number }[];
  assignedStaff: string[];
  milestones: { label: string; time: string; done: boolean; department: Department }[];
  beoNumber: string;
  notes: string;
  revenueEstimate: number;
  laborCostEstimate: number;
};

export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
export type IncidentStatus = "Open" | "In Progress" | "Escalated" | "Resolved";

export type Incident = {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  department: Department;
  reportedBy: string;
  reportedAt: string;
  assignedTo: string | null;
  resolvedAt: string | null;
  guestImpact: boolean;
  escalatedToExec: boolean;
  recoveryAction: string | null;
  updates: { timestamp: string; author: string; note: string }[];
};

export type ReadinessItem = {
  id: string;
  label: string;
  done: boolean;
  critical: boolean;
};

export type DepartmentReadiness = {
  department: Department;
  shift: "AM" | "PM" | "Overnight";
  date: string;
  items: ReadinessItem[];
  submittedBy: string | null;
  submittedAt: string | null;
};

export type ForecastDay = {
  date: string;
  dayOfWeek: string;
  predictedOccupancy: number;
  predictedGuests: number;
  eventsCount: number;
  recommendedStaff: Partial<Record<Department, number>>;
  scheduledStaff: Partial<Record<Department, number>>;
  laborCostProjected: number;
  revenueProjected: number;
};

export type AutomationAlert = {
  id: string;
  rule: 1 | 2 | 3;
  severity: "RED" | "YELLOW" | "GREEN";
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
};

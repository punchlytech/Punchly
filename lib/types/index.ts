// ===== Database Entity Types =====

export type UserRole = "manager" | "engineer";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  location: string;
  client_name: string;
  status: "active" | "completed" | "on_hold";
  created_by: string;
  start_date: string;
  target_completion_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  project_id: string;
  unit_number: string;
  unit_type: string;
  floor: string;
  block: string | null;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export type SnagCategory =
  | "electrical"
  | "plumbing"
  | "finishing"
  | "structural"
  | "hvac"
  | "other";

export type SnagPriority = "low" | "medium" | "high" | "critical";

export type SnagStatus = "open" | "in_progress" | "resolved" | "verified";

export interface Snag {
  id: string;
  unit_id: string;
  project_id: string;
  title: string;
  description: string;
  category: SnagCategory;
  priority: SnagPriority;
  status: SnagStatus;
  location: string;
  photo_url: string | null;
  annotated_photo_url: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  project_id: string;
  unit_id: string | null;
  report_type: "unit_snag_list" | "project_summary" | "handover";
  pdf_url: string;
  qr_code_url: string;
  generated_by: string | null;
  generated_at: string;
  created_at: string;
}

// ===== Dashboard Types =====

export interface DashboardMetrics {
  openIssues: number;
  resolved: number;
  pendingReview: number;
}

export interface TeamPerformance {
  name: string;
  role: string;
  unitsInspected: number;
  snagsLogged: number;
  resolvedThisWeek: number;
}

// ===== Inspection Types =====

export interface SnagPhoto {
  id: string;
  file: File | null;
  preview: string;
  annotatedPreview?: string;
}

export interface SnagLocation {
  id: string;
  location: string;
  description: string;
  photos: SnagPhoto[];
}

export interface InspectionData {
  id: string;
  projectName: string;
  unitNumber: string;
  clientName: string;
  inspectionDate: string;
  engineerName: string;
  locations: SnagLocation[];
  status: "draft" | "submitted";
  createdAt: string;
  updatedAt: string;
}

// ===== Auth Types =====

export interface DemoUser {
  username: string;
  role: UserRole;
  fullName: string;
}

// ===== Snags Library Types =====

export interface ProjectWithSnagCount extends Project {
  snag_count: number;
  unit_count: number;
  latest_activity: string | null;
}

export interface SnagWithUnit extends Snag {
  unit?: Unit;
}

// ===== Analytics Types =====

export interface AnalyticsKPI {
  resolutionRate: number;
  avgResolutionTimeDays: number;
  totalSnags: number;
  qualityScore: number;
}

export interface CategoryBreakdown {
  category: SnagCategory;
  count: number;
}

export interface PriorityBreakdown {
  priority: SnagPriority;
  count: number;
}

export interface EngineerMetrics {
  name: string;
  snagsLogged: number;
  resolved: number;
  avgResolutionTimeDays: number;
}

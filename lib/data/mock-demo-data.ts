/**
 * Punchly Demo Mode — Virtual Seed Data
 *
 * When "Demo Mode" is active, every dashboard component, Snags Library,
 * and Analytics page reads from this file instead of hitting Supabase.
 *
 * Toggle off → the app returns to its live state (0 metrics, empty DB).
 */

import type {
  DashboardMetrics,
  TeamPerformance,
  AnalyticsKPI,
  CategoryBreakdown,
  PriorityBreakdown,
  SnagCategory,
  SnagPriority,
  SnagStatus,
} from "@/lib/types";

// ─── Helper: deterministic UUID-like IDs ─────────────────────────────

function id(prefix: string, n: number) {
  return `demo-${prefix}-${String(n).padStart(3, "0")}`;
}

function daysAgo(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}

// ═══════════════════════════════════════════════════════════════════════
// 1. PROJECTS  (5 virtual folders)
// ═══════════════════════════════════════════════════════════════════════

export interface DemoProject {
  id: string;
  name: string;
  description: string;
  location: string;
  client_name: string;
  status: "active" | "completed" | "on_hold";
  snag_count: number;
  unit_count: number;
  latest_activity: string | null;
}

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: id("prj", 1),
    name: "Swan Lake Residences",
    description: "Premium waterfront villas with private gardens",
    location: "Dubai Marina, Dubai",
    client_name: "Swan Lake Development LLC",
    status: "active",
    snag_count: 8,
    unit_count: 6,
    latest_activity: daysAgo(1),
  },
  {
    id: id("prj", 2),
    name: "HAP Town Phase II",
    description: "Mixed-use community with retail and residential towers",
    location: "Yas Island, Abu Dhabi",
    client_name: "HAP Properties",
    status: "active",
    snag_count: 6,
    unit_count: 5,
    latest_activity: daysAgo(2),
  },
  {
    id: id("prj", 3),
    name: "Park View Towers",
    description: "Two 30-storey residential towers overlooking Central Park",
    location: "Downtown Jebel Ali",
    client_name: "Park View Holdings",
    status: "active",
    snag_count: 5,
    unit_count: 4,
    latest_activity: daysAgo(3),
  },
  {
    id: id("prj", 4),
    name: "Oasis Gardens",
    description: "Low-rise garden apartments with shared amenities",
    location: "Al Reem Island, Abu Dhabi",
    client_name: "Oasis Real Estate",
    status: "active",
    snag_count: 3,
    unit_count: 3,
    latest_activity: daysAgo(5),
  },
  {
    id: id("prj", 5),
    name: "Marina Heights",
    description: "Luxury penthouses and sky villas with marina views",
    location: "Jumeirah Beach Residence",
    client_name: "Heights Development Co.",
    status: "completed",
    snag_count: 2,
    unit_count: 2,
    latest_activity: daysAgo(10),
  },
];

// ═══════════════════════════════════════════════════════════════════════
// 2. SNAGS  (24 sample snags across the 5 projects)
// ═══════════════════════════════════════════════════════════════════════

export interface DemoSnag {
  id: string;
  project_id: string;
  unit_id: string;
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
  // Joined unit info (for snag list)
  units?: { unit_number: string; unit_type: string; floor?: string } | null;
}

export const DEMO_SNAGS: DemoSnag[] = [
  // ── Swan Lake Residences (8 snags) ──────────────────────────────────
  {
    id: id("snag", 1),
    project_id: id("prj", 1),
    unit_id: id("unit", 1),
    title: "Exposed wiring in kitchen ceiling",
    description: "Electrical cables visible through gap in false ceiling above island counter",
    category: "electrical",
    priority: "critical",
    status: "open",
    location: "Kitchen",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    units: { unit_number: "SL-V101", unit_type: "Villa", floor: "G" },
  },
  {
    id: id("snag", 2),
    project_id: id("prj", 1),
    unit_id: id("unit", 1),
    title: "Water stain on master bedroom wall",
    description: "Brown discoloration approx 30cm diameter on north-facing wall",
    category: "plumbing",
    priority: "high",
    status: "in_progress",
    location: "Master Bedroom",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(4),
    updated_at: daysAgo(3),
    units: { unit_number: "SL-V101", unit_type: "Villa", floor: "G" },
  },
  {
    id: id("snag", 3),
    project_id: id("prj", 1),
    unit_id: id("unit", 2),
    title: "Cracked floor tile in living room",
    description: "Hairline crack on porcelain tile near balcony door threshold",
    category: "finishing",
    priority: "medium",
    status: "resolved",
    location: "Living Room",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(1),
    verified_at: null,
    created_at: daysAgo(7),
    updated_at: daysAgo(1),
    units: { unit_number: "SL-V102", unit_type: "Villa", floor: "G" },
  },
  {
    id: id("snag", 4),
    project_id: id("prj", 1),
    unit_id: id("unit", 2),
    title: "HVAC vent misaligned in study",
    description: "Ceiling-mounted supply vent rotated ~15 degrees from flush alignment",
    category: "hvac",
    priority: "low",
    status: "verified",
    location: "Study",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(5),
    verified_at: daysAgo(3),
    created_at: daysAgo(10),
    updated_at: daysAgo(3),
    units: { unit_number: "SL-V102", unit_type: "Villa", floor: "G" },
  },
  {
    id: id("snag", 5),
    project_id: id("prj", 1),
    unit_id: id("unit", 3),
    title: "Paint bubbling on bathroom ceiling",
    description: "Moisture damage causing paint to bubble above shower enclosure",
    category: "finishing",
    priority: "high",
    status: "open",
    location: "En-Suite Bathroom",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    units: { unit_number: "SL-V103", unit_type: "Villa", floor: "G" },
  },
  {
    id: id("snag", 6),
    project_id: id("prj", 1),
    unit_id: id("unit", 3),
    title: "Door handle loose on main entrance",
    description: "Lever handle has excessive play and doesn't spring back",
    category: "finishing",
    priority: "medium",
    status: "resolved",
    location: "Main Entrance",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(2),
    verified_at: null,
    created_at: daysAgo(6),
    updated_at: daysAgo(2),
    units: { unit_number: "SL-V103", unit_type: "Villa", floor: "G" },
  },
  {
    id: id("snag", 7),
    project_id: id("prj", 1),
    unit_id: id("unit", 4),
    title: "Socket not earthed in garage",
    description: "13A double socket on east wall shows no earth continuity",
    category: "electrical",
    priority: "critical",
    status: "in_progress",
    location: "Garage",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    units: { unit_number: "SL-V104", unit_type: "Villa", floor: "G" },
  },
  {
    id: id("snag", 8),
    project_id: id("prj", 1),
    unit_id: id("unit", 4),
    title: "Grout missing between counter backsplash tiles",
    description: "Approximately 40cm run of missing grout behind kitchen sink",
    category: "finishing",
    priority: "low",
    status: "verified",
    location: "Kitchen",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(4),
    verified_at: daysAgo(2),
    created_at: daysAgo(12),
    updated_at: daysAgo(2),
    units: { unit_number: "SL-V104", unit_type: "Villa", floor: "G" },
  },

  // ── HAP Town Phase II (6 snags) ─────────────────────────────────────
  {
    id: id("snag", 9),
    project_id: id("prj", 2),
    unit_id: id("unit", 5),
    title: "Leaking pipe under bathroom sink",
    description: "Slow drip at P-trap joint, approximately 1 drip per 5 seconds",
    category: "plumbing",
    priority: "high",
    status: "open",
    location: "Bathroom",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    units: { unit_number: "HT-A204", unit_type: "2BR", floor: "2" },
  },
  {
    id: id("snag", 10),
    project_id: id("prj", 2),
    unit_id: id("unit", 5),
    title: "Light switch wired in reverse",
    description: "Down position is ON, up is OFF — opposite of standard",
    category: "electrical",
    priority: "medium",
    status: "resolved",
    location: "Living Room",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(1),
    verified_at: null,
    created_at: daysAgo(5),
    updated_at: daysAgo(1),
    units: { unit_number: "HT-A204", unit_type: "2BR", floor: "2" },
  },
  {
    id: id("snag", 11),
    project_id: id("prj", 2),
    unit_id: id("unit", 6),
    title: "Scratched window glass in bedroom",
    description: "Visible scratch ~20cm long on interior face of double-glazed unit",
    category: "finishing",
    priority: "medium",
    status: "open",
    location: "Bedroom 2",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    units: { unit_number: "HT-B310", unit_type: "1BR", floor: "3" },
  },
  {
    id: id("snag", 12),
    project_id: id("prj", 2),
    unit_id: id("unit", 6),
    title: "AC not cooling below 24C",
    description: "Split unit runs but cannot maintain set temperature of 22C",
    category: "hvac",
    priority: "high",
    status: "in_progress",
    location: "Living Room",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(4),
    updated_at: daysAgo(2),
    units: { unit_number: "HT-B310", unit_type: "1BR", floor: "3" },
  },
  {
    id: id("snag", 13),
    project_id: id("prj", 2),
    unit_id: id("unit", 7),
    title: "Uneven floor leveling in hallway",
    description: "Spirit level shows 3mm deviation over 2m span near entrance",
    category: "structural",
    priority: "medium",
    status: "resolved",
    location: "Hallway",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(3),
    verified_at: null,
    created_at: daysAgo(8),
    updated_at: daysAgo(3),
    units: { unit_number: "HT-C115", unit_type: "Studio", floor: "1" },
  },
  {
    id: id("snag", 14),
    project_id: id("prj", 2),
    unit_id: id("unit", 7),
    title: "Fire door closer not engaging",
    description: "Door closer arm disconnected, door does not self-close",
    category: "other",
    priority: "critical",
    status: "open",
    location: "Entrance Door",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    units: { unit_number: "HT-C115", unit_type: "Studio", floor: "1" },
  },

  // ── Park View Towers (5 snags) ──────────────────────────────────────
  {
    id: id("snag", 15),
    project_id: id("prj", 3),
    unit_id: id("unit", 8),
    title: "Ceiling crack in master bedroom",
    description: "Linear crack ~1.5m along junction of wall and ceiling",
    category: "structural",
    priority: "high",
    status: "open",
    location: "Master Bedroom",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    units: { unit_number: "PV-T1-1805", unit_type: "2BR", floor: "18" },
  },
  {
    id: id("snag", 16),
    project_id: id("prj", 3),
    unit_id: id("unit", 8),
    title: "Balcony railing loose at anchor point",
    description: "Glass panel railing wobbles when pressed — bolts need tightening",
    category: "structural",
    priority: "critical",
    status: "in_progress",
    location: "Balcony",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(2),
    updated_at: daysAgo(1),
    units: { unit_number: "PV-T1-1805", unit_type: "2BR", floor: "18" },
  },
  {
    id: id("snag", 17),
    project_id: id("prj", 3),
    unit_id: id("unit", 9),
    title: "Shower drain blocked",
    description: "Water pools in shower tray, takes 5+ minutes to drain",
    category: "plumbing",
    priority: "medium",
    status: "resolved",
    location: "Bathroom",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(2),
    verified_at: null,
    created_at: daysAgo(6),
    updated_at: daysAgo(2),
    units: { unit_number: "PV-T2-901", unit_type: "1BR", floor: "9" },
  },
  {
    id: id("snag", 18),
    project_id: id("prj", 3),
    unit_id: id("unit", 9),
    title: "Kitchen cabinet door misaligned",
    description: "Upper cabinet door on south wall sits 5mm lower than adjacent",
    category: "finishing",
    priority: "low",
    status: "verified",
    location: "Kitchen",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(4),
    verified_at: daysAgo(2),
    created_at: daysAgo(9),
    updated_at: daysAgo(2),
    units: { unit_number: "PV-T2-901", unit_type: "1BR", floor: "9" },
  },
  {
    id: id("snag", 19),
    project_id: id("prj", 3),
    unit_id: id("unit", 10),
    title: "Intercom system not functional",
    description: "Unit intercom does not receive signal from lobby panel",
    category: "electrical",
    priority: "high",
    status: "open",
    location: "Entrance",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    units: { unit_number: "PV-T1-2210", unit_type: "3BR", floor: "22" },
  },

  // ── Oasis Gardens (3 snags) ─────────────────────────────────────────
  {
    id: id("snag", 20),
    project_id: id("prj", 4),
    unit_id: id("unit", 11),
    title: "Garden irrigation valve stuck",
    description: "Zone 3 solenoid valve not opening — no water to front garden beds",
    category: "plumbing",
    priority: "medium",
    status: "open",
    location: "Garden",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    units: { unit_number: "OG-G12", unit_type: "2BR", floor: "G" },
  },
  {
    id: id("snag", 21),
    project_id: id("prj", 4),
    unit_id: id("unit", 12),
    title: "Downlight flickering in hallway",
    description: "LED downlight intermittently flickers when switched on",
    category: "electrical",
    priority: "low",
    status: "resolved",
    location: "Hallway",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(3),
    verified_at: null,
    created_at: daysAgo(7),
    updated_at: daysAgo(3),
    units: { unit_number: "OG-G18", unit_type: "1BR", floor: "G" },
  },
  {
    id: id("snag", 22),
    project_id: id("prj", 4),
    unit_id: id("unit", 13),
    title: "External render cracking above window",
    description: "Diagonal crack from window lintel corner on east elevation",
    category: "structural",
    priority: "high",
    status: "in_progress",
    location: "External Wall",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: null,
    verified_at: null,
    created_at: daysAgo(6),
    updated_at: daysAgo(4),
    units: { unit_number: "OG-G24", unit_type: "3BR", floor: "G" },
  },

  // ── Marina Heights (2 snags — completed project) ────────────────────
  {
    id: id("snag", 23),
    project_id: id("prj", 5),
    unit_id: id("unit", 14),
    title: "Marble countertop chip near edge",
    description: "Small chip ~8mm on kitchen island front edge",
    category: "finishing",
    priority: "low",
    status: "resolved",
    location: "Kitchen",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(8),
    verified_at: null,
    created_at: daysAgo(14),
    updated_at: daysAgo(8),
    units: { unit_number: "MH-PH01", unit_type: "Penthouse", floor: "42" },
  },
  {
    id: id("snag", 24),
    project_id: id("prj", 5),
    unit_id: id("unit", 15),
    title: "Smart lock firmware outdated",
    description: "Entry lock running firmware v1.2, needs update to v2.0 for app connectivity",
    category: "other",
    priority: "low",
    status: "verified",
    location: "Main Entrance",
    photo_url: null,
    annotated_photo_url: null,
    reported_by: "admin2",
    assigned_to: null,
    resolved_at: daysAgo(9),
    verified_at: daysAgo(7),
    created_at: daysAgo(15),
    updated_at: daysAgo(7),
    units: { unit_number: "MH-SV02", unit_type: "Sky Villa", floor: "38" },
  },
];

// ═══════════════════════════════════════════════════════════════════════
// 3. PRE-COMPUTED DASHBOARD METRICS
// ═══════════════════════════════════════════════════════════════════════

// Derive from snag data for consistency
const openCount = DEMO_SNAGS.filter(
  (s) => s.status === "open" || s.status === "in_progress"
).length;
const resolvedCount = DEMO_SNAGS.filter((s) => s.status === "resolved").length;
const verifiedCount = DEMO_SNAGS.filter((s) => s.status === "verified").length;

export const DEMO_DASHBOARD_METRICS: DashboardMetrics = {
  openIssues: openCount,        // should be 10
  resolved: resolvedCount,       // should be 8
  pendingReview: verifiedCount,  // should be 6 (verified = pending final review)
};

// ═══════════════════════════════════════════════════════════════════════
// 4. TEAM PERFORMANCE  (admin2 = engineer with the required stats)
// ═══════════════════════════════════════════════════════════════════════

export const DEMO_TEAM_PERFORMANCE: TeamPerformance[] = [
  {
    name: "admin2 (Site Engineer)",
    role: "Field Engineer",
    unitsInspected: 45,
    snagsLogged: 24,
    resolvedThisWeek: 38,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// 5. ANALYTICS & KPI
// ═══════════════════════════════════════════════════════════════════════

const totalSnags = DEMO_SNAGS.length;
const resolvedAndVerified = resolvedCount + verifiedCount;
const resolutionRate = Math.round((resolvedAndVerified / totalSnags) * 100);

// Average resolution time: use only resolved/verified snags that have resolved_at
const resolvedSnags = DEMO_SNAGS.filter((s) => s.resolved_at);
const avgDays =
  resolvedSnags.length > 0
    ? Math.round(
        (resolvedSnags.reduce((sum, s) => {
          const created = new Date(s.created_at).getTime();
          const resolved = new Date(s.resolved_at!).getTime();
          return sum + (resolved - created) / (1000 * 60 * 60 * 24);
        }, 0) /
          resolvedSnags.length) *
          10
      ) / 10
    : 0;

// Quality score (same formula as analytics.ts)
const speedScore = avgDays <= 1 ? 10 : avgDays <= 3 ? 8 : avgDays <= 7 ? 6 : 4;
const qualityScore =
  Math.round(((resolutionRate / 100) * 6 + (speedScore / 10) * 4) * 10) / 10;

export const DEMO_KPI: AnalyticsKPI = {
  resolutionRate,
  avgResolutionTimeDays: avgDays,
  totalSnags,
  qualityScore: Math.min(qualityScore, 10),
};

// ── Category Breakdown ────────────────────────────────────────────────

function countByCategory(cat: SnagCategory): number {
  return DEMO_SNAGS.filter((s) => s.category === cat).length;
}

export const DEMO_CATEGORIES: CategoryBreakdown[] = (
  ["electrical", "plumbing", "finishing", "structural", "hvac", "other"] as SnagCategory[]
)
  .map((cat) => ({ category: cat, count: countByCategory(cat) }))
  .filter((c) => c.count > 0);

// ── Priority Breakdown ────────────────────────────────────────────────

function countByPriority(p: SnagPriority): number {
  return DEMO_SNAGS.filter((s) => s.priority === p).length;
}

export const DEMO_PRIORITIES: PriorityBreakdown[] = (
  ["critical", "high", "medium", "low"] as SnagPriority[]
).map((p) => ({ priority: p, count: countByPriority(p) }));

// ═══════════════════════════════════════════════════════════════════════
// 6. HELPER: Get snags for a specific demo project
// ═══════════════════════════════════════════════════════════════════════

export function getDemoSnagsByProject(projectId: string): DemoSnag[] {
  return DEMO_SNAGS.filter((s) => s.project_id === projectId);
}

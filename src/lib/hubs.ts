import { ShieldAlert, Radar, Users, Compass, type LucideIcon } from "lucide-react";

/**
 * "4 Jobs, 1 Brain" simplification model.
 * Every existing feature is grouped under one of 4 user jobs.
 * No routes are removed — this only re-organises navigation.
 */
export type HubKey = "report" | "watch" | "act" | "ask";

export interface HubLink {
  path: string;
  label: string;
  desc: string;
  /** Feature key from PLATFORM_FEATURES — link is hidden if user lacks access. Omit to always show. */
  featureKey?: string;
  /** Restrict to roles. Omit to allow all. */
  roles?: string[];
}

export interface Hub {
  key: HubKey;
  label: string;
  tagline: string;
  icon: LucideIcon;
  /** Tailwind text color token. */
  accent: string;
  /** Primary action when the hub button itself is clicked. */
  primaryPath: string;
  links: HubLink[];
}

export const HUBS: Hub[] = [
  {
    key: "report",
    label: "Report",
    tagline: "Raise the alarm — safely and with evidence",
    icon: ShieldAlert,
    accent: "text-brown",
    primaryPath: "/incidents",
    links: [
      { path: "/incidents", label: "Report an incident", desc: "Geo-tagged, with photo or evidence", featureKey: "incidents" },
      { path: "/voice", label: "Share a voice testimony", desc: "Record what you witnessed in your language", featureKey: "voice" },
      { path: "/safety", label: "Find safety & support", desc: "Safe spaces, hotlines, and help nearby", featureKey: "safety" },
      { path: "/elections", label: "Flag an election concern", desc: "Polling, intimidation, or irregularities", featureKey: "elections" },
    ],
  },
  {
    key: "watch",
    label: "Monitor",
    tagline: "Read the signals across the continent",
    icon: Radar,
    accent: "text-primary",
    primaryPath: "/peace-pulse",
    links: [
      { path: "/peace-pulse", label: "Peace Pulse", desc: "Live indicators across Africa", featureKey: "peace-pulse" },
      { path: "/early-warning", label: "Early warning map", desc: "Emerging risks and hotspots" },
      { path: "/dashboard/early-warning", label: "Operations console", desc: "Full early-warning workspace", featureKey: "early-warning", roles: ["admin", "government", "partner"] },
      { path: "/communication", label: "Coordination hub", desc: "OCHA SITREPs, 3W, and broadcasts", featureKey: "communication", roles: ["admin", "government", "partner", "verifier"] },
      { path: "/verification", label: "Verification queue", desc: "Help confirm reports with evidence", featureKey: "verification", roles: ["admin", "government", "verifier"] },
    ],
  },
  {
    key: "act",
    label: "Engage",
    tagline: "Build peace with your community",
    icon: Users,
    accent: "text-secondary",
    primaryPath: "/community",
    links: [
      { path: "/community", label: "Community voices", desc: "Stories, posts, and conversations", featureKey: "community" },
      { path: "/proposals", label: "Proposals & polls", desc: "Shape policy with your vote", featureKey: "proposals" },
      { path: "/challenges", label: "Peace challenges", desc: "Take action, earn recognition", featureKey: "challenges" },
      { path: "/radio", label: "Peace Radio", desc: "Listen, call in, and be heard", featureKey: "radio" },
      { path: "/mediation", label: "Mediation Suite", desc: "Convene parties, track agreements", roles: ["admin", "government", "partner", "verifier"] },
    ],
  },
  {
    key: "ask",
    label: "Discover",
    tagline: "Ask NuruAI — your civic intelligence companion",
    icon: Compass,
    accent: "text-gold",
    primaryPath: "/nuru-ai",
    links: [
      { path: "/nuru-ai", label: "Ask NuruAI", desc: "Cited answers on civic and peace topics", featureKey: "nuru-ai" },
      { path: "/nuru-ai?tab=fact-check", label: "Fact-check a claim", desc: "IFCN-aligned verification", featureKey: "nuru-ai" },
      { path: "/nuru-ai?tab=briefings", label: "Daily briefings", desc: "Concise, sourced situation summaries", featureKey: "nuru-ai" },
      { path: "/nuru-ai?tab=policy", label: "Policy explorer", desc: "Search constitutions, laws, and frameworks", featureKey: "nuru-ai" },
    ],
  },
];

/** Filter hub links by accessible features + user roles. */
export function filterHubLinks(
  hub: Hub,
  accessibleFeatures: string[],
  userRoles: string[]
): HubLink[] {
  return hub.links.filter((link) => {
    if (link.featureKey && !accessibleFeatures.includes(link.featureKey)) return false;
    if (link.roles && !link.roles.some((r) => userRoles.includes(r))) return false;
    return true;
  });
}

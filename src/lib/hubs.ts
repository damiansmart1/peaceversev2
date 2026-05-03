import { Siren, Eye, Megaphone, Sparkles, type LucideIcon } from "lucide-react";

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
    tagline: "Something happened — let someone know",
    icon: Siren,
    accent: "text-destructive",
    primaryPath: "/incidents",
    links: [
      { path: "/incidents", label: "Report an incident", desc: "Geo-tagged with photo / evidence", featureKey: "incidents" },
      { path: "/voice", label: "Share a voice story", desc: "Record what you witnessed", featureKey: "voice" },
      { path: "/safety", label: "Safety check-in", desc: "Find help and safe spaces", featureKey: "safety" },
      { path: "/elections", label: "Election issue", desc: "Report polling or violence", featureKey: "elections" },
    ],
  },
  {
    key: "watch",
    label: "Watch",
    tagline: "See what's happening around you",
    icon: Eye,
    accent: "text-primary",
    primaryPath: "/peace-pulse",
    links: [
      { path: "/peace-pulse", label: "Peace Pulse", desc: "Live analytics across Africa", featureKey: "peace-pulse" },
      { path: "/early-warning", label: "Early warning", desc: "Predictive risk hotspots" },
      { path: "/dashboard/early-warning", label: "Operations dashboard", desc: "Full early-warning console", featureKey: "early-warning", roles: ["admin", "government", "partner"] },
      { path: "/communication", label: "Coordination hub", desc: "OCHA SITREPs & broadcasts", featureKey: "communication", roles: ["admin", "government", "partner", "verifier"] },
      { path: "/verification", label: "Verification queue", desc: "Help verify reports", featureKey: "verification", roles: ["admin", "government", "verifier"] },
    ],
  },
  {
    key: "act",
    label: "Act",
    tagline: "Do something about it",
    icon: Megaphone,
    accent: "text-secondary",
    primaryPath: "/community",
    links: [
      { path: "/community", label: "Community feed", desc: "Connect & post", featureKey: "community" },
      { path: "/proposals", label: "Polls & proposals", desc: "Vote and shape policy", featureKey: "proposals" },
      { path: "/challenges", label: "Peace challenges", desc: "Earn points & rewards", featureKey: "challenges" },
      { path: "/radio", label: "Peace Radio", desc: "Listen and call in", featureKey: "radio" },
    ],
  },
  {
    key: "ask",
    label: "Ask Nuru",
    tagline: "Get answers, fact-checks, and briefings",
    icon: Sparkles,
    accent: "text-gold",
    primaryPath: "/nuru-ai",
    links: [
      { path: "/nuru-ai", label: "Ask NuruAI", desc: "Civic intelligence assistant", featureKey: "nuru-ai" },
      { path: "/nuru-ai?tab=fact-check", label: "Fact-check a claim", desc: "IFCN-aligned verification" },
      { path: "/nuru-ai?tab=briefings", label: "Daily briefings", desc: "Cited situation summaries" },
      { path: "/nuru-ai?tab=policy", label: "Policy explorer", desc: "Search constitutions & laws" },
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

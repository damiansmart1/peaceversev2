---
name: Calmer institutional design system
description: Phase-1 refresh — restrained typography, calmer Card defaults, surface-quiet/eyebrow/pill utilities, mobile bottom nav reserves body padding
type: design
---
**Typography**: Mobile-first restrained scale in `src/index.css` (h1: 1.75–3rem clamp, h2: 1.375–2.125rem). Avoid going back to oversized `text-5xl`+ headings on dashboards.

**Card defaults**: `src/components/ui/card.tsx` uses `border-border/60`, no shadow by default, padding `p-4 sm:p-5` (was `p-6`). CardTitle is `text-lg sm:text-xl` (was `text-2xl`).

**New utilities** (use these instead of ad-hoc styles):
- `.section-y` / `.section-y-sm` — standard vertical rhythm
- `.surface-quiet` / `.surface-quiet-active` — calm card surfaces
- `.eyebrow` — small uppercase section label
- `.pill` + `.pill-success/warning/destructive/primary` — status badges
- `.live-dot` — reserve pulse animation for true live alerts only
- `.has-mobile-nav` — opt-in bottom padding (body already has it globally <lg)

**Layout primitives** (`src/components/layout/`):
- `SectionShell` — single-header section wrapper with optional eyebrow + actions
- `StatStrip` — single inline metrics row (replaces "5 colorful stat cards" pattern)

**How to apply**: When refactoring a dashboard, replace the colorful 5-card stat grid with `<StatStrip>`, wrap sections in `<SectionShell>`, use `pill-*` for status, and drop ad-hoc `ring-2`/heavy gradients.

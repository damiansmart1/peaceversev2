---
name: Cinematic motion & primitives system
description: Reusable primitives for scroll reveals, animated counters, page transitions, branded empty/skeleton states, coach marks, scrollable tabs
type: design
---

## Motion primitives (use everywhere)
- `<Reveal from="bottom" delay={i*60}>` — scroll-triggered fade+slide. Supports bottom/top/left/right/scale/fade. Respects prefers-reduced-motion. From `@/components/motion/Reveal`.
- `<AnimatedCounter value={12450} suffix="+" />` — easeOutExpo ramp on view. Use on hero stats and dashboards. From `@/components/motion/AnimatedCounter`.
- `<PageTransition>` — wraps `<Routes/>` in App.tsx. Subtle fade+lift on every route change.

## Loading & empty states (replace ALL blank screens / generic spinners)
- `FeedSkeleton`, `ListSkeleton`, `DashboardSkeleton` from `@/components/skeletons/FeedSkeleton`.
- `EmptyState` upgraded with illustrated orb (gradient blur + ring + icon), variants: default | search | feed | alerts | minimal. Always offer an `actionLabel`.

## Coach marks (first-run guidance)
- `<CoachMark id="unique-key" title="..." description="...">` wraps any element. Auto-shows once, persists dismissal in localStorage under `coachmark:<id>`.
- `resetCoachMarks()` clears all (use in admin "restart tour" action).
- Active coach marks: `hero-report-cta` on Home.

## Visual hierarchy primitives
- `ScrollableTabsList` from `@/components/ui/scrollable-tabs` — replaces `TabsList` when 4+ tabs would wrap on mobile. Horizontal scroll with auto gradient fade-edges.
- `SectionImageBanner` now has shorter mobile heights (h-40 → h-80) and `title` is optional.

## Social feed polish
- `StoriesRail` — horizontal rail of recent creators with animated gradient ring; first slot = create.
- `PresenceDot count={N} label="creators online"` — pulsing green dot + count.
- `HeartBurst active={isLiked}` — overlay micro-burst on like; mount inside relative button.

## Rule
Never reintroduce generic spinners or blank "no results" panels — always reach for these primitives.

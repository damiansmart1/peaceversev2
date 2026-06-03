---
name: Per-role onboarding tours
description: OnboardingTour selects a tailored 5-step tour per primary role (citizen/verifier/partner/government/admin), keyed by localStorage `hasSeenOnboarding:<role>`. Reset via resetOnboardingTours().
type: feature
---
Primary role precedence (highest wins): admin > government > partner > verifier > citizen. Anonymous / no-role users get the citizen tour. Each role has its own localStorage flag so a user who gains a new role sees that role's tour once.

Implementation lives entirely in `src/components/OnboardingTour.tsx`. Tours follow the calmer institutional design system (pill eyebrow, gradient icon tile, 5 steps max).

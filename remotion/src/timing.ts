// Beat timings derived from the recorded narration (30fps).
// Each entry = frames allotted to the on-screen beat that matches one narration line.
export const BEATS = {
  hook: [308, 153, 432],
  problem: [501, 480],
  idea: [400],
  rights: [486, 566],
  pillar1: [413, 393],
  inclusion: [367, 432],
  languages: [223, 455],
  pillar2: [436, 348],
  offline: [303, 306],
  pillar3: [346, 311],
  reports: [557, 490],
  pillar4: [351, 264],
  impact: [504],
  closing: [425],
} as const;

export const SCENE_DUR = Object.fromEntries(
  Object.entries(BEATS).map(([k, v]) => [k, (v as readonly number[]).reduce((a, b) => a + b, 0)])
) as Record<keyof typeof BEATS, number>;

export const TOTAL_FRAMES = Object.values(SCENE_DUR).reduce((a, b) => a + b, 0);

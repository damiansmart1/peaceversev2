import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";
import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/Problem";
import { Idea } from "./scenes/Idea";
import { Rights } from "./scenes/Rights";
import { Pillar1 } from "./scenes/Pillar1";
import { Inclusion } from "./scenes/Inclusion";
import { Languages } from "./scenes/Languages";
import { Pillar2 } from "./scenes/Pillar2";
import { Offline } from "./scenes/Offline";
import { Pillar3 } from "./scenes/Pillar3";
import { Reports } from "./scenes/Reports";
import { Pillar4 } from "./scenes/Pillar4";
import { Impact } from "./scenes/Impact";
import { Closing } from "./scenes/Closing";
import { C } from "./theme";
import { SCENE_DUR, TOTAL_FRAMES } from "./timing";

const display = loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

export const TOTAL = TOTAL_FRAMES;

const ORDER: { dur: number; comp: React.FC }[] = [
  { dur: SCENE_DUR.hook, comp: Hook },
  { dur: SCENE_DUR.problem, comp: Problem },
  { dur: SCENE_DUR.idea, comp: Idea },
  { dur: SCENE_DUR.rights, comp: Rights },
  { dur: SCENE_DUR.pillar1, comp: Pillar1 },
  { dur: SCENE_DUR.inclusion, comp: Inclusion },
  { dur: SCENE_DUR.languages, comp: Languages },
  { dur: SCENE_DUR.pillar2, comp: Pillar2 },
  { dur: SCENE_DUR.offline, comp: Offline },
  { dur: SCENE_DUR.pillar3, comp: Pillar3 },
  { dur: SCENE_DUR.reports, comp: Reports },
  { dur: SCENE_DUR.pillar4, comp: Pillar4 },
  { dur: SCENE_DUR.impact, comp: Impact },
  { dur: SCENE_DUR.closing, comp: Closing },
];


let cursor = 0;
const SEGMENTS = ORDER.map((s) => {
  const from = cursor;
  cursor += s.dur;
  return { ...s, from };
});

const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const progress = f / TOTAL;
  const fade = interpolate(f, [0, 20, TOTAL - 200, TOTAL - 40], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 110,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: fade * 0.9,
          fontFamily: "var(--body)",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 99,
            background: C.gold,
            boxShadow: `0 0 22px ${C.gold}`,
          }}
        />
        <span style={{ color: "#fff", fontWeight: 700, letterSpacing: 2, fontSize: 24 }}>
          PEACE<span style={{ color: C.gold }}>VERSE</span>
        </span>
        <span style={{ color: `${C.cream}77`, fontSize: 20, letterSpacing: 3 }}>
          DETECT · VERIFY · PREVENT
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 6,
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${C.blue}, ${C.green} 55%, ${C.gold})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => (
  <AbsoluteFill
    style={
      {
        background: C.ink,
        ["--display" as string]: display.fontFamily,
        ["--body" as string]: body.fontFamily,
      } as React.CSSProperties
    }
  >
    {SEGMENTS.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.dur}>
        <s.comp />
      </Sequence>
    ))}
    <Chrome />
  </AbsoluteFill>
);

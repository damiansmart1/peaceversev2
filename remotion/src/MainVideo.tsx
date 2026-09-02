import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";
import { Hook } from "./scenes/Hook";
import { Idea } from "./scenes/Idea";
import { Pillar1 } from "./scenes/Pillar1";
import { Pillar2 } from "./scenes/Pillar2";
import { Pillar3 } from "./scenes/Pillar3";
import { Pillar4 } from "./scenes/Pillar4";
import { Impact } from "./scenes/Impact";
import { Closing } from "./scenes/Closing";
import { C } from "./theme";

const display = loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

const SEGMENTS: { from: number; dur: number; comp: React.FC; tc: string }[] = [
  { from: 0, dur: 450, comp: Hook, tc: "00:00" },
  { from: 450, dur: 390, comp: Idea, tc: "00:15" },
  { from: 840, dur: 510, comp: Pillar1, tc: "00:28" },
  { from: 1350, dur: 600, comp: Pillar2, tc: "00:45" },
  { from: 1950, dur: 510, comp: Pillar3, tc: "01:05" },
  { from: 2460, dur: 480, comp: Pillar4, tc: "01:22" },
  { from: 2940, dur: 510, comp: Impact, tc: "01:38" },
  { from: 3450, dur: 150, comp: Closing, tc: "01:55" },
];

const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const progress = f / 3600;
  const fade = interpolate(f, [0, 20, 3400, 3560], [0, 1, 1, 0], {
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

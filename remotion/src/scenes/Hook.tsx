import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow } from "../components/Caption";
import { C } from "../theme";

const Beat: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      padding: "0 190px",
      gap: 26,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const vignette = interpolate(f, [0, 60], [1, 0.55], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 70% at 50% 50%, transparent 30%, #000000${Math.round(
            vignette * 160
          ).toString(16)} 100%)`,
        }}
      />

      <Sequence from={0} durationInFrames={308}>
        <Beat>
          <Eyebrow text="Northern Kenya · 04:12" delay={4} color={C.gold} />
          <Line text="Imagine a mother in Northern Kenya." delay={12} size={78} display weight={700} />
          <Line
            text="She hears rumors. Armed men are moving toward her village."
            delay={52}
            size={42}
            color={`${C.cream}DD`}
          />
          <Line
            text="No radio. No internet. No one to call."
            delay={86}
            size={42}
            color={`${C.cream}DD`}
          />
        </Beat>
      </Sequence>

      <Sequence from={308} durationInFrames={153}>
        <Beat>
          <Line
            text="By the time the world finds out,"
            delay={6}
            size={58}
            color={`${C.cream}EE`}
          />
          <Line
            text="her family is already running."
            delay={34}
            size={72}
            display
            weight={700}
            color={C.gold}
          />
        </Beat>
      </Sequence>

      <Sequence from={461} durationInFrames={432}>
        <Beat>
          <Line text="Now… imagine the opposite." delay={4} size={54} color={`${C.cream}CC`} />
          <Line
            text="She sends one message — one —"
            delay={38}
            size={76}
            display
            weight={700}
          />
          <Line
            text="and within minutes, aid agencies, local leaders and peace responders know exactly where help is needed."
            delay={76}
            size={40}
            color={`${C.cream}DD`}
          />
          <Line
            text="That is not science fiction. That is PeaceVerse."
            delay={140}
            size={52}
            display
            weight={700}
            color={C.gold}
          />
        </Beat>
      </Sequence>
    </AbsoluteFill>
  );
};

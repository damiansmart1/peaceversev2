import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow } from "../components/Caption";
import { C } from "../theme";

const Stat: React.FC<{ who: string; what: string; delay: number; accent: string }> = ({
  who,
  what,
  delay,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 }, durationInFrames: 30 });
  return (
    <div
      style={{
        flex: 1,
        padding: "34px 32px",
        borderRadius: 20,
        background: "#FFFFFF0A",
        borderLeft: `5px solid ${accent}`,
        border: `1px solid ${C.cream}22`,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--body)",
          fontSize: 21,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: accent,
          marginBottom: 14,
          fontWeight: 700,
        }}
      >
        {who}
      </div>
      <div style={{ fontFamily: "var(--display)", fontSize: 36, lineHeight: 1.22, color: "#fff", fontWeight: 600 }}>
        {what}
      </div>
    </div>
  );
};

export const Impact: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />
    <AbsoluteFill style={{ padding: "110px 120px", justifyContent: "center", gap: 44 }}>
      <Eyebrow text="The true impact" delay={2} />
      <Line text="Let me be specific about what this means." delay={10} size={58} display weight={700} />
      <div style={{ display: "flex", gap: 26, marginTop: 10 }}>
        <Stat who="For UNHCR" what="Protecting refugees hours faster." delay={70} accent={C.gold} />
        <Stat who="For governments" what="Preventing violence before it starts." delay={95} accent="#8FC2F5" />
        <Stat who="For communities" what="Finally being heard." delay={120} accent="#7FD196" />
        <Stat who="For donors" what="Every dollar traced to a life protected." delay={145} accent="#E0A46A" />
      </div>
      <Sequence from={230} layout="none">
        <div style={{ marginTop: 44 }}>
          <Line
            text="PeaceVerse does not just collect data. It builds trust. It saves lives."
            delay={0}
            size={44}
            color={`${C.cream}EE`}
          />
          <div style={{ height: 16 }} />
          <Line text="It keeps peace within reach." delay={40} size={54} display weight={700} color={C.gold} />
        </div>
      </Sequence>
    </AbsoluteFill>
  </AbsoluteFill>
);

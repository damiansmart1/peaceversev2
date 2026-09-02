import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Pill } from "../components/Caption";
import { C } from "../theme";

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26, textAlign: "center" }}>
        <div style={{ opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})` }}>
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: 120,
              fontWeight: 700,
              letterSpacing: -2,
              color: "#fff",
            }}
          >
            Peace<span style={{ color: C.gold }}>Verse</span>
          </div>
        </div>
        <Line text="The future of peace in Africa is not reactive." delay={30} size={38} color={`${C.cream}CC`} />
        <Line text="It is predictive. Inclusive. Coordinated." delay={58} size={44} display weight={600} />
        <div style={{ display: "flex", gap: 16, marginTop: 22 }}>
          <Pill text="DETECT" delay={92} />
          <Pill text="VERIFY" delay={106} bg={`${C.green}33`} fg="#7FD196" />
          <Pill text="PREVENT" delay={120} bg={`${C.blue}44`} fg="#8FC2F5" />
        </div>
        <div style={{ marginTop: 30 }}>
          <Line text="Let us build it — together." delay={150} size={52} display weight={700} color={C.gold} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

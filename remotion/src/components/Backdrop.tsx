import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C } from "../theme";

export const Backdrop: React.FC<{ tone?: "dark" | "light" }> = ({
  tone = "dark",
}) => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 220) * 60;
  const drift2 = Math.cos(f / 180) * 80;
  const base =
    tone === "dark"
      ? `linear-gradient(140deg, ${C.ink} 0%, ${C.blueDeep} 55%, #071A2B 100%)`
      : `linear-gradient(140deg, ${C.paper} 0%, #EFE6D3 60%, #E7DCC6 100%)`;

  return (
    <AbsoluteFill style={{ background: base }}>
      <AbsoluteFill
        style={{
          opacity: tone === "dark" ? 0.5 : 0.35,
          background: `radial-gradient(60% 55% at ${18 + drift / 20}% ${
            22 + drift2 / 30
          }%, ${C.blue}AA 0%, transparent 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: tone === "dark" ? 0.42 : 0.3,
          background: `radial-gradient(50% 50% at ${82 - drift / 24}% ${
            76 + drift / 40
          }%, ${C.green}99 0%, transparent 62%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.22,
          background: `radial-gradient(38% 38% at ${70 + drift2 / 30}% ${
            18 + drift2 / 50
          }%, ${C.gold}88 0%, transparent 65%)`,
        }}
      />
      {/* horizon line motif */}
      <AbsoluteFill
        style={{
          opacity: 0.16,
          background: `repeating-linear-gradient(0deg, transparent 0px, transparent 58px, ${
            tone === "dark" ? "#ffffff22" : "#00000014"
          } 59px, transparent 60px)`,
          transform: `translateY(${interpolate(f, [0, 900], [0, -40])}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

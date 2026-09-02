import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { C } from "../theme";

export const Eyebrow: React.FC<{ text: string; delay?: number; color?: string }> = ({
  text,
  delay = 0,
  color = C.gold,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 20 });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        opacity: s,
        transform: `translateX(${interpolate(s, [0, 1], [-24, 0])}px)`,
      }}
    >
      <div style={{ width: interpolate(s, [0, 1], [0, 46]), height: 3, background: color }} />
      <span
        style={{
          fontFamily: "var(--body)",
          letterSpacing: 5,
          fontSize: 22,
          textTransform: "uppercase",
          color,
          fontWeight: 600,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const Line: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  weight?: number;
  color?: string;
  display?: boolean;
  hold?: number;
}> = ({ text, delay = 0, size = 46, weight = 500, color = "#FFFFFF", display = false, hold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 24 });
  const out = hold
    ? interpolate(frame, [delay + hold, delay + hold + 16], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  return (
    <div
      style={{
        fontFamily: display ? "var(--display)" : "var(--body)",
        fontSize: size,
        lineHeight: 1.18,
        fontWeight: weight,
        color,
        opacity: s * out,
        transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
        filter: `blur(${interpolate(s, [0, 1], [8, 0])}px)`,
        maxWidth: 1080,
      }}
    >
      {text}
    </div>
  );
};

export const Pill: React.FC<{ text: string; delay?: number; bg?: string; fg?: string }> = ({
  text,
  delay = 0,
  bg = `${C.gold}22`,
  fg = C.gold,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 140 }, durationInFrames: 26 });
  return (
    <div
      style={{
        padding: "12px 26px",
        borderRadius: 999,
        background: bg,
        border: `1.5px solid ${fg}66`,
        color: fg,
        fontFamily: "var(--body)",
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: 1.5,
        opacity: Math.min(1, s * 1.2),
        transform: `scale(${interpolate(s, [0, 1], [0.72, 1])})`,
      }}
    >
      {text}
    </div>
  );
};

import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../theme";

export const DataCard: React.FC<{
  value: string;
  label: string;
  source?: string;
  delay?: number;
  accent?: string;
}> = ({ value, label, source, delay = 0, accent = C.gold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 130 },
    durationInFrames: 28,
  });
  return (
    <div
      style={{
        flex: 1,
        padding: "30px 30px 26px",
        borderRadius: 20,
        background: "#FFFFFF0A",
        border: `1px solid ${C.cream}22`,
        borderTop: `4px solid ${accent}`,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [42, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: 62,
          lineHeight: 1,
          fontWeight: 700,
          color: accent,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--body)",
          fontSize: 28,
          lineHeight: 1.25,
          color: "#fff",
          marginTop: 14,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      {source ? (
        <div
          style={{
            fontFamily: "var(--body)",
            fontSize: 19,
            color: `${C.cream}88`,
            marginTop: 12,
            letterSpacing: 0.6,
          }}
        >
          {source}
        </div>
      ) : null}
    </div>
  );
};

export const Row: React.FC<{
  left: string;
  right: string;
  delay?: number;
  accent?: string;
}> = ({ left, right, delay = 0, accent = "#7FD196" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        opacity: s,
        transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 470,
          fontFamily: "var(--body)",
          fontSize: 30,
          color: `${C.cream}AA`,
        }}
      >
        {left}
      </div>
      <div style={{ width: 46, height: 2, background: `${accent}88` }} />
      <div
        style={{
          flex: 1,
          fontFamily: "var(--display)",
          fontSize: 32,
          fontWeight: 600,
          color: accent,
        }}
      >
        {right}
      </div>
    </div>
  );
};

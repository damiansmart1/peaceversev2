import { Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { C } from "../theme";

type Props = {
  shot: string;
  /** vertical pan across the screenshot, 0..1 */
  panFrom?: number;
  panTo?: number;
  zoom?: number;
  delay?: number;
  label?: string;
  width?: number;
  height?: number;
};

export const DeviceShot: React.FC<Props> = ({
  shot,
  panFrom = 0,
  panTo = 0.35,
  zoom = 1.06,
  delay = 0,
  label,
  width = 1020,
  height = 620,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 26,
  });
  const enter = interpolate(s, [0, 1], [0.94, 1]);
  const y = interpolate(s, [0, 1], [46, 0]);
  const pan = interpolate(
    frame,
    [delay, durationInFrames],
    [panFrom, panTo],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width,
        transform: `translateY(${y}px) scale(${enter})`,
        opacity: s,
      }}
    >
      <div
        style={{
          borderRadius: 22,
          overflow: "hidden",
          background: "#0A1520",
          border: `1px solid ${C.cream}33`,
          boxShadow: "0 50px 120px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            height: 42,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "0 18px",
            background: "#0E1D2B",
            borderBottom: `1px solid ${C.cream}1A`,
          }}
        >
          {[C.brown, C.gold, C.green].map((c) => (
            <div
              key={c}
              style={{ width: 11, height: 11, borderRadius: 99, background: c }}
            />
          ))}
          <div
            style={{
              marginLeft: 16,
              color: `${C.cream}AA`,
              fontSize: 17,
              letterSpacing: 0.6,
              fontFamily: "var(--body)",
            }}
          >
            peaceverse.africa{label ? ` — ${label}` : ""}
          </div>
        </div>
        <div style={{ height, overflow: "hidden", position: "relative" }}>
          <Img
            src={staticFile(`shots/${shot}.png`)}
            style={{
              width: "100%",
              display: "block",
              transform: `scale(${zoom}) translateY(${-pan * 34}%)`,
              transformOrigin: "top center",
            }}
          />
        </div>
      </div>
    </div>
  );
};

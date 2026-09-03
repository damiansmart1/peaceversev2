import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow, Pill } from "../components/Caption";
import { DeviceShot } from "../components/DeviceShot";
import { C } from "../theme";

const Step: React.FC<{ n: string; title: string; body: string; delay: number; accent: string }> = ({
  n,
  title,
  body,
  delay,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 }, durationInFrames: 26 });
  return (
    <div
      style={{
        flex: 1,
        padding: "28px 28px",
        borderRadius: 20,
        background: "#FFFFFF0A",
        border: `1px solid ${C.cream}22`,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [36, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 99,
          background: `${accent}22`,
          border: `1.5px solid ${accent}`,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--display)",
          fontWeight: 700,
          fontSize: 26,
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: 32,
          color: "#fff",
          fontWeight: 700,
          marginTop: 18,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "var(--body)",
          fontSize: 25,
          lineHeight: 1.35,
          color: `${C.cream}BB`,
          marginTop: 10,
        }}
      >
        {body}
      </div>
    </div>
  );
};

export const Offline: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={303}>
      <AbsoluteFill style={{ flexDirection: "row-reverse", alignItems: "center", padding: "60px 110px 0", gap: 56 }}>
        <div style={{ width: 780, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="Built for the last mile" delay={2} color="#7FD196" />
          <Line text="Works where the network does not." delay={10} size={62} display weight={700} color={C.gold} />
          <Line
            text="An installable app that keeps alerts, safe-space maps and emergency contacts on the phone — readable with zero bars."
            delay={56}
            size={34}
            color={`${C.cream}CC`}
          />
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
            <Sequence from={0} layout="none">
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Pill text="OFFLINE CACHE" delay={104} bg={`${C.green}33`} fg="#7FD196" />
                <Pill text="QUEUE & AUTO-SYNC" delay={118} />
                <Pill text="USSD *384#" delay={132} bg={`${C.blue}44`} fg="#8FC2F5" />
                <Pill text="SMS FALLBACK" delay={146} bg={`${C.brown}44`} fg="#E0A46A" />
              </div>
            </Sequence>
          </div>
        </div>
        <DeviceShot shot="safety" label="Offline & SMS access" delay={18} panFrom={0.1} panTo={0.5} width={860} height={560} />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={303} durationInFrames={306}>
      <AbsoluteFill style={{ padding: "150px 120px 90px", justifyContent: "center", gap: 34 }}>
        <Eyebrow text="A report from a village with no signal" delay={2} color={C.gold} />
        <Line text="Nothing is lost. Nothing waits for a tower." delay={8} size={52} display weight={700} />
        <div style={{ display: "flex", gap: 22, marginTop: 18 }}>
          <Step
            n="1"
            title="Capture offline"
            body="The report, photo and GPS pin are saved on the device — no connection needed."
            delay={44}
            accent="#7FD196"
          />
          <Step
            n="2"
            title="Send any way possible"
            body="USSD or SMS from a basic phone reaches the same intake as the app."
            delay={68}
            accent={C.gold}
          />
          <Step
            n="3"
            title="Sync automatically"
            body="The moment a signal returns, queued reports upload in order with their timestamps intact."
            delay={92}
            accent="#8FC2F5"
          />
          <Step
            n="4"
            title="Alerts come back"
            body="Warnings return by SMS and radio, so households without data still get told."
            delay={116}
            accent="#E0A46A"
          />
        </div>
        <Line
          text="Remote camps, pastoral corridors, border villages — the hardest places to reach are exactly where this matters most."
          delay={156}
          size={34}
          color={`${C.cream}CC`}
        />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

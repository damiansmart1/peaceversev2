import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow } from "../components/Caption";
import { DeviceShot } from "../components/DeviceShot";
import { C } from "../theme";

const Doc: React.FC<{ title: string; who: string; body: string; delay: number; accent: string }> = ({
  title,
  who,
  body,
  delay,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 130 }, durationInFrames: 26 });
  return (
    <div
      style={{
        flex: 1,
        padding: "26px 26px 24px",
        borderRadius: 18,
        background: "#FFFFFF0A",
        border: `1px solid ${C.cream}22`,
        borderLeft: `5px solid ${accent}`,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [34, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: 30,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "var(--body)",
          fontSize: 19,
          letterSpacing: 2.4,
          textTransform: "uppercase",
          color: accent,
          marginTop: 8,
          fontWeight: 700,
        }}
      >
        {who}
      </div>
      <div
        style={{
          fontFamily: "var(--body)",
          fontSize: 24,
          lineHeight: 1.35,
          color: `${C.cream}BB`,
          marginTop: 12,
        }}
      >
        {body}
      </div>
    </div>
  );
};

export const Reports: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={230}>
      <AbsoluteFill style={{ padding: "140px 110px 80px", justifyContent: "center", gap: 30 }}>
        <Eyebrow text="Evidence you can hand to a decision maker" delay={2} color={C.gold} />
        <Line text="One click turns field signals into institutional reporting." delay={8} size={52} display weight={700} />
        <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
          <Doc
            title="OCHA SITREP"
            who="Humanitarian coordination"
            body="Situation reports and Flash Updates in the format clusters already use."
            delay={44}
            accent={C.gold}
          />
          <Doc
            title="3W Matrix"
            who="Who · What · Where"
            body="Live map of which partner is doing what, where — no more duplicated response."
            delay={64}
            accent="#8FC2F5"
          />
          <Doc
            title="Early Warning Brief"
            who="Governments & AU/RECs"
            body="Risk index, hotspot projections and recommended actions by district."
            delay={84}
            accent="#E2795E"
          />
          <Doc
            title="Verification / ClaimReview"
            who="Media & fact-checkers"
            body="IFCN-standard fact-check records with sources and shareable evidence."
            delay={104}
            accent="#7FD196"
          />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <Doc
            title="MEL Baseline–Endline"
            who="Donors & programme teams"
            body="Indicator tracking from baseline to endline, exportable for grant reporting."
            delay={128}
            accent="#E0A46A"
          />
          <Doc
            title="Mediation Case File"
            who="Mediators & peace committees"
            body="Parties, sessions, dialogue record and signed agreement commitments."
            delay={148}
            accent={C.gold}
          />
          <Doc
            title="Election Observation"
            who="Observers & commissions"
            body="Polling-station incidents, PVT statistics and a tamper-evident audit trail."
            delay={168}
            accent="#8FC2F5"
          />
          <Doc
            title="API & Data Feed"
            who="Integrating systems"
            body="JSON, GeoJSON and CAP 1.2 feeds straight into existing EWS dashboards."
            delay={188}
            accent="#7FD196"
          />
        </div>
      </AbsoluteFill>
    </Sequence>

    <Sequence from={230} durationInFrames={190}>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "60px 110px 0", gap: 56 }}>
        <div style={{ width: 760, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="What that looks like in practice" delay={2} />
          <Line
            text="An Officer In-Charge wakes up to a two-page brief, not a spreadsheet."
            delay={10}
            size={50}
            display
            weight={700}
          />

          <Line
            text="A UNHCR protection team sees the corridor at risk before movement begins."
            delay={54}
            size={34}
            color={`${C.cream}CC`}
          />
          <Line
            text="A donor opens an endline report and sees exactly what changed, and where."
            delay={92}
            size={34}
            color={`${C.cream}CC`}
          />
          <Line
            text="Every export is timestamped, sourced and auditable."
            delay={130}
            size={38}
            color={C.gold}
          />
        </div>
        <DeviceShot shot="pulse" label="Peace Pulse reporting" delay={16} panFrom={0.05} panTo={0.45} width={880} height={560} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

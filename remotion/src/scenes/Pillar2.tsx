import { AbsoluteFill, Sequence } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow, Pill } from "../components/Caption";
import { DeviceShot } from "../components/DeviceShot";
import { C } from "../theme";

export const Pillar2: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={300}>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 60 }}>
        <div style={{ width: 700, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="Pillar 2 · NuruAI" delay={2} />
          <Line text="Information without verification is just noise." delay={8} size={52} color={`${C.cream}DD`} />
          <Line
            text="NuruAI is PeaceVerse's fact-checking engine."
            delay={70}
            size={62}
            display
            weight={700}
          />
          <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
            <Pill text="MISINFORMATION FLAGGED" delay={130} />
            <Pill text="SOURCE CONFIDENCE" delay={148} bg={`${C.green}33`} fg="#7FD196" />
          </div>
          <Line
            text="It spots misinformation, flags emerging threats, and gives agencies like UNHCR verified truth before panic spreads."
            delay={190}
            size={34}
            color={`${C.cream}CC`}
          />
        </div>
        <DeviceShot shot="nuru" label="NuruAI verification" delay={18} panTo={0.4} width={880} height={600} />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={300} durationInFrames={300}>
      <AbsoluteFill style={{ flexDirection: "row-reverse", alignItems: "center", padding: "0 110px", gap: 60 }}>
        <div style={{ width: 680, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="Verified incident ledger" delay={2} color="#8FC2F5" />
          <Line
            text="Because in a crisis, the wrong rumor can be as deadly as the conflict itself."
            delay={10}
            size={54}
            display
            weight={700}
            color={C.gold}
          />
          <Line
            text="Every report is triaged, cross-checked against trusted sources, and published with an audit trail institutions can defend."
            delay={90}
            size={34}
            color={`${C.cream}CC`}
          />
        </div>
        <DeviceShot shot="incidents" label="Incident intelligence" delay={16} panFrom={0.05} panTo={0.5} width={880} height={600} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

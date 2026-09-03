import { AbsoluteFill, Sequence } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow, Pill } from "../components/Caption";
import { DeviceShot } from "../components/DeviceShot";
import { C } from "../theme";

export const Pillar4: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={351}>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 60 }}>
        <div style={{ width: 680, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="Pillar 4 · Mediation Suite" delay={2} />
          <Line text="PeaceVerse does not stop at alerts." delay={8} size={56} display weight={700} />
          <Line
            text="Structured dialogue, party mapping, session records and agreement tracking — online and offline."
            delay={70}
            size={34}
            color={`${C.cream}CC`}
          />
          <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
            <Pill text="DIALOGUE SESSIONS" delay={130} bg={`${C.green}33`} fg="#7FD196" />
            <Pill text="AGREEMENTS" delay={148} />
          </div>
        </div>
        <DeviceShot shot="mediation" label="Mediation workspace" delay={16} panTo={0.42} width={880} height={600} />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={351} durationInFrames={264}>
      <AbsoluteFill style={{ flexDirection: "row-reverse", alignItems: "center", padding: "0 110px", gap: 60 }}>
        <div style={{ width: 680, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="Monitoring, Evaluation & Learning" delay={2} color="#8FC2F5" />
          <Line
            text="Run peace programs from baseline to endline."
            delay={10}
            size={58}
            display
            weight={700}
          />
          <Line
            text="Cut field costs, and prove impact to donors with real, traceable data."
            delay={70}
            size={36}
            color={C.gold}
          />
        </div>
        <DeviceShot shot="community" label="Community & engagement" delay={14} panFrom={0.05} panTo={0.45} width={880} height={600} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

import { AbsoluteFill, Sequence } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow, Pill } from "../components/Caption";
import { DeviceShot } from "../components/DeviceShot";
import { C } from "../theme";

export const Pillar3: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={346}>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 60 }}>
        <div style={{ width: 660, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="Pillar 3 · Alerts Command Center" delay={2} />
          <Line
            text="One command center. Governments, NGOs and UN agencies — together."
            delay={10}
            size={56}
            display
            weight={700}
          />
          <Line
            text="Live alerts, risk maps, response workflows, acknowledgement and SLA tracking in a single operational picture."
            delay={80}
            size={34}
            color={`${C.cream}CC`}
          />
          <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
            <Pill text="LIVE ALERT STREAM" delay={150} />
            <Pill text="ROUTING & ACK" delay={168} bg={`${C.blue}44`} fg="#8FC2F5" />
          </div>
        </div>
        <DeviceShot shot="ew" label="Early Warning · Command Center" delay={16} panTo={0.45} width={900} height={620} />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={346} durationInFrames={311}>
      <AbsoluteFill style={{ flexDirection: "row-reverse", alignItems: "center", padding: "0 110px", gap: 60 }}>
        <div style={{ width: 660, display: "flex", flexDirection: "column", gap: 20 }}>
          <Eyebrow text="Peace Pulse analytics" delay={2} color="#7FD196" />
          <Line text="No more silos." delay={10} size={64} display weight={700} />
          <Line text="No more guessing." delay={40} size={64} display weight={700} color={C.cream} />
          <Line text="No more “we did not know.”" delay={70} size={64} display weight={700} color={C.gold} />
          <Line
            text="Just one shared picture of what is happening, where, and who needs help right now."
            delay={120}
            size={34}
            color={`${C.cream}CC`}
          />
        </div>
        <DeviceShot shot="pulse" label="Peace Pulse" delay={14} panFrom={0.05} panTo={0.5} width={880} height={600} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

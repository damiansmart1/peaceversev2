import { AbsoluteFill, Sequence } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow, Pill } from "../components/Caption";
import { DeviceShot } from "../components/DeviceShot";
import { C } from "../theme";

export const Pillar1: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={413}>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 60 }}>
        <div style={{ width: 700, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="Pillar 1 · Report Hub" delay={2} />
          <Line
            text="The people closest to the danger are closest to the solution."
            delay={10}
            size={58}
            display
            weight={700}
          />
          <Line
            text="A farmer in Mali. A refugee in Uganda. A youth leader in Nairobi."
            delay={70}
            size={34}
            color={`${C.cream}CC`}
          />
          <Line
            text="They report incidents in seconds — with location, evidence and category."
            delay={120}
            size={34}
            color={`${C.cream}CC`}
          />
        </div>
        <DeviceShot shot="report" label="Report an incident" delay={20} panTo={0.4} width={880} height={580} />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={413} durationInFrames={393}>
      <AbsoluteFill style={{ flexDirection: "row-reverse", alignItems: "center", padding: "0 110px", gap: 60 }}>
        <div style={{ width: 680, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="App · SMS · USSD · Radio" delay={2} color="#7FD196" />
          <Line text="No internet? No problem." delay={12} size={70} display weight={700} color={C.gold} />
          <Line
            text="Reports arrive by SMS and USSD from basic phones, and by radio call-in from the last mile."
            delay={60}
            size={34}
            color={`${C.cream}CC`}
          />
          <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
            <Pill text="*384# USSD" delay={110} bg={`${C.green}33`} fg="#7FD196" />
            <Pill text="SMS 40404" delay={126} />
            <Pill text="RADIO CALL-IN" delay={142} bg={`${C.blue}44`} fg="#8FC2F5" />
          </div>
          <Line
            text="Their voices do not get lost in bureaucracy. They become the signal."
            delay={175}
            size={34}
            color="#FFFFFF"
          />
        </div>
        <DeviceShot shot="safety" label="SMS / USSD gateway" delay={18} panFrom={0.05} panTo={0.45} width={880} height={580} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

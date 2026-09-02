import { AbsoluteFill, Sequence } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow, Pill } from "../components/Caption";
import { DeviceShot } from "../components/DeviceShot";
import { Row } from "../components/DataCard";
import { C } from "../theme";

export const Inclusion: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={230}>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "60px 110px 0", gap: 56 }}>
        <div style={{ width: 800, display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow text="Designed for those usually left out" delay={2} color="#7FD196" />
          <Line
            text="Peace fails first for the people systems forget."
            delay={10}
            size={58}
            display
            weight={700}
          />
          <Line
            text="PeaceVerse is built around them — not around headquarters."
            delay={56}
            size={34}
            color={`${C.cream}CC`}
          />
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
            <Sequence from={0} layout="none">
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Pill text="REFUGEES & IDPs" delay={92} />
                <Pill text="WOMEN & GIRLS" delay={106} bg={`${C.green}33`} fg="#7FD196" />
                <Pill text="YOUTH" delay={120} bg={`${C.blue}44`} fg="#8FC2F5" />
                <Pill text="PASTORALISTS" delay={134} bg={`${C.brown}44`} fg="#E0A46A" />
                <Pill text="PERSONS WITH DISABILITIES" delay={148} />
              </div>
            </Sequence>
          </div>
        </div>
        <DeviceShot shot="community" label="Community hub" delay={20} panTo={0.42} width={860} height={560} />
      </AbsoluteFill>
    </Sequence>

    <Sequence from={230} durationInFrames={220}>
      <AbsoluteFill style={{ padding: "150px 130px 90px", justifyContent: "center", gap: 28 }}>
        <Eyebrow text="Barrier → what PeaceVerse does" delay={2} color={C.gold} />
        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 14 }}>
          <Row left="No smartphone, no data bundle" right="SMS, USSD *384# and radio call-in on any handset" delay={26} />
          <Row
            left="Fear of retaliation for speaking up"
            right="Anonymous reporting, masked identity, reporter-safety monitoring"
            delay={56}
            accent={C.gold}
          />
          <Row
            left="Cannot read or write confidently"
            right="Voice reporting, icon-led flows, screen-reader and high-contrast modes"
            delay={86}
            accent="#8FC2F5"
          />
          <Row
            left="Displaced, far from any office"
            right="Safe-space maps, emergency contacts and alerts that work offline"
            delay={116}
            accent="#E0A46A"
          />
        </div>
        <Line
          text="When the most vulnerable can report safely, early warning finally reaches everyone."
          delay={160}
          size={38}
          color="#FFFFFF"
        />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

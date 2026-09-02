import { AbsoluteFill, Sequence } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow, Pill } from "../components/Caption";
import { DeviceShot } from "../components/DeviceShot";
import { C } from "../theme";

export const Idea: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 60 }}>
      <div style={{ width: 720, display: "flex", flexDirection: "column", gap: 24 }}>
        <Eyebrow text="The idea worth spreading" delay={2} />
        <Line
          text="Africa's early warning and peacebuilding platform."
          delay={10}
          size={62}
          display
          weight={700}
        />
        <Line
          text="Built for the continent. Powered by its people. Trusted by institutions."
          delay={54}
          size={34}
          color={`${C.cream}CC`}
        />
        <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
          <Sequence from={0}>
            <div style={{ display: "flex", gap: 18 }}>
              <Pill text="DETECT" delay={110} />
              <Pill text="VERIFY" delay={128} bg={`${C.green}33`} fg="#7FD196" />
              <Pill text="PREVENT" delay={146} bg={`${C.blue}44`} fg="#8FC2F5" />
            </div>
          </Sequence>
        </div>
      </div>
      <DeviceShot shot="home" label="Home" delay={22} panFrom={0} panTo={0.28} width={900} height={560} />
    </AbsoluteFill>
  </AbsoluteFill>
);

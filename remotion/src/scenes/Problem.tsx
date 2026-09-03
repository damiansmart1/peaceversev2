import { AbsoluteFill, Sequence } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow } from "../components/Caption";
import { DataCard, Row } from "../components/DataCard";
import { C } from "../theme";

export const Problem: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={210}>
      <AbsoluteFill style={{ padding: "150px 120px 90px", justifyContent: "center", gap: 34 }}>
        <Eyebrow text="The problem today" delay={2} color="#E2795E" />
        <Line
          text="Warnings exist. They just arrive late, unverified, and in the wrong language."
          delay={10}
          size={58}
          display
          weight={700}
        />
        <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
          <DataCard
            value="122.6M"
            label="People forcibly displaced worldwide by mid-2024 — Africa carries the largest share"
            source="UNHCR Mid-Year Trends 2024"
            delay={54}
            accent="#E2795E"
          />
          <DataCard
            value="296"
            label="Internet shutdowns in 54 countries in 2024 — the worst year ever recorded"
            source="Access Now #KeepItOn, 2024 report"
            delay={74}
            accent={C.gold}
          />
          <DataCard
            value="51%"
            label="Of all global terrorism deaths in 2024 occurred in the Sahel"
            source="Global Terrorism Index 2025, IEP"
            delay={94}
            accent="#8FC2F5"
          />
          <DataCard
            value="~38%"
            label="Internet use in Africa — most people still report by basic phone, in local languages"
            source="ITU Facts & Figures 2024"
            delay={114}
            accent="#7FD196"
          />
        </div>
      </AbsoluteFill>
    </Sequence>

    <Sequence from={210} durationInFrames={210}>
      <AbsoluteFill style={{ padding: "150px 130px 90px", justifyContent: "center", gap: 30 }}>
        <Eyebrow text="What late warning costs" delay={2} color="#E2795E" />
        <Line text="These are not hypotheticals — they are the last five years." delay={8} size={54} display weight={700} />
        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 22 }}>
          <Row
            left="Sudan, since April 2023"
            right="12M+ displaced — the world's largest displacement crisis (UNHCR, 2025)"
            delay={40}
            accent="#E2795E"
          />
          <Row
            left="Eastern DRC escalation, 2025"
            right="Fall of Goma; ~7M internally displaced — alerts outrun by the front line (OCHA / UNHCR)"
            delay={70}
            accent={C.gold}
          />
          <Row
            left="Sahel coup belt, 2020–2023"
            right="Mali, Guinea, Sudan, Chad, Burkina Faso, Niger, Gabon — democratic transitions interrupted"
            delay={100}
            accent="#8FC2F5"
          />
          <Row
            left="Africa's election super-cycle, 2024–2026"
            right="Contested polls met with shutdowns and disinformation — 21 shutdowns across 15 African countries in 2024 (Access Now)"
            delay={130}
            accent="#7FD196"
          />
        </div>
        <Line
          text="Every one of these is a signal that existed before the violence. Nobody could see it in time."
          delay={168}
          size={34}
          color={`${C.cream}CC`}
        />
      </AbsoluteFill>
    </Sequence>

  </AbsoluteFill>
);

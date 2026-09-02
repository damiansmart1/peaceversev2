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
            value="45M+"
            label="People forcibly displaced across Africa"
            source="UNHCR Global Trends"
            delay={54}
            accent="#E2795E"
          />
          <DataCard
            value="~38%"
            label="Of Africans use the internet — most report by basic phone"
            source="ITU Facts & Figures"
            delay={74}
            accent={C.gold}
          />
          <DataCard
            value="2,000+"
            label="Languages spoken — most early warning is English or French only"
            source="UNESCO / AU"
            delay={94}
            accent="#8FC2F5"
          />
          <DataCard
            value="$1 : $16"
            label="Every $1 spent preventing conflict saves about $16 in response"
            source="UN–World Bank, Pathways for Peace"
            delay={114}
            accent="#7FD196"
          />
        </div>
      </AbsoluteFill>
    </Sequence>

    <Sequence from={210} durationInFrames={210}>
      <AbsoluteFill style={{ padding: "150px 130px 90px", justifyContent: "center", gap: 30 }}>
        <Eyebrow text="What late warning costs" delay={2} color="#E2795E" />
        <Line text="These are not hypotheticals." delay={8} size={54} display weight={700} />
        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 22 }}>
          <Row
            left="Kenya 2007–08 post-election violence"
            right="1,100+ killed · 600,000 displaced — rumours spread faster than facts"
            delay={40}
            accent="#E2795E"
          />
          <Row
            left="Sudan, since April 2023"
            right="12M+ displaced — the world's largest displacement crisis"
            delay={70}
            accent={C.gold}
          />
          <Row
            left="Karamoja & cross-border pastoral corridors"
            right="Cattle raids escalate in hours; alerts often travel in days"
            delay={100}
            accent="#8FC2F5"
          />
          <Row
            left="Lake Chad Basin & Sahel"
            right="Communities warn each other — but no shared, verified picture"
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

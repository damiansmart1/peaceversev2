import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow } from "../components/Caption";
import { C } from "../theme";

const Pillar: React.FC<{ title: string; body: string; delay: number; accent: string }> = ({
  title,
  body,
  delay,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 }, durationInFrames: 28 });
  return (
    <div
      style={{
        flex: 1,
        padding: "30px 28px",
        borderRadius: 20,
        background: "#FFFFFF0A",
        border: `1px solid ${C.cream}22`,
        borderTop: `5px solid ${accent}`,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [38, 0])}px)`,
      }}
    >
      <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, color: "#fff" }}>{title}</div>
      <div
        style={{
          fontFamily: "var(--body)",
          fontSize: 24,
          lineHeight: 1.36,
          color: `${C.cream}BB`,
          marginTop: 12,
        }}
      >
        {body}
      </div>
    </div>
  );
};

export const Rights: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={486}>
      <AbsoluteFill style={{ padding: "140px 120px 90px", justifyContent: "center", gap: 30 }}>
        <Eyebrow text="Civic tech for democracy & human rights" delay={2} color={C.gold} />
        <Line
          text="PeaceVerse is not neutral about people. It stands with them."
          delay={8}
          size={58}
          display
          weight={700}
        />
        <Line
          text="Across Africa and the Global South, the same rights keep coming under pressure: the right to speak, the right to be counted, the right to be protected."
          delay={48}
          size={36}
          color={`${C.cream}DD`}
        />
        <div style={{ display: "flex", gap: 22, marginTop: 22 }}>
          <Pillar
            title="Freedom of expression"
            body="2024 was the worst year on record for internet shutdowns — 296 shutdowns in 54 countries. Our SMS and USSD channels keep communities heard when the network goes dark."
            delay={86}
            accent="#E2795E"
          />
          <Pillar
            title="Free & credible elections"
            body="Observer reporting, PVT statistics and a tamper-evident audit trail — so results are defended by evidence, not by rumour."
            delay={110}
            accent="#8FC2F5"
          />
          <Pillar
            title="Protection & accountability"
            body="Anonymous, encrypted reporting with data masking, so a witness never pays with their safety for telling the truth."
            delay={134}
            accent="#7FD196"
          />
        </div>
      </AbsoluteFill>
    </Sequence>

    <Sequence from={486} durationInFrames={566}>
      <AbsoluteFill style={{ padding: "150px 150px 90px", justifyContent: "center", gap: 28 }}>
        <Eyebrow text="Rights-based by design" delay={2} />
        <Line
          text="Every report is owned by the person who made it."
          delay={8}
          size={62}
          display
          weight={700}
        />
        <Line
          text="Consent-first data. Identity protected by default. Human review before any AI judgement becomes an official record."
          delay={44}
          size={38}
          color={`${C.cream}DD`}
        />
        <Line
          text="Aligned to UNSCR 2250, AU Agenda 2063 and SDG 16 — peace, justice and strong institutions."
          delay={86}
          size={38}
          color="#8FC2F5"
        />
        <Line
          text="Democracy is not an event every five years. It is a conversation — and everyone deserves a line into it."
          delay={124}
          size={46}
          display
          weight={700}
          color={C.gold}
        />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

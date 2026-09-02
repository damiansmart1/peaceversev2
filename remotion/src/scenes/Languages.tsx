import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Line, Eyebrow } from "../components/Caption";
import { C } from "../theme";

const PHRASES = [
  { lang: "English", text: "Help is on the way." },
  { lang: "Kiswahili", text: "Msaada unakuja." },
  { lang: "Français", text: "Les secours arrivent." },
  { lang: "العربية", text: "المساعدة في الطريق." },
  { lang: "Hausa", text: "Taimako yana zuwa." },
  { lang: "Amharic / አማርኛ", text: "እርዳታ በመንገድ ላይ ነው።" },
  { lang: "Português", text: "A ajuda está a caminho." },
  { lang: "Somali", text: "Caawimaaddu way soo socotaa." },
  { lang: "Yorùbá", text: "Ìrànlọ́wọ́ ń bọ̀." },
  { lang: "isiZulu", text: "Usizo luyeza." },
];

const Chip: React.FC<{ lang: string; text: string; delay: number }> = ({ lang, text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 130 }, durationInFrames: 24 });
  return (
    <div
      style={{
        padding: "20px 26px",
        borderRadius: 18,
        background: "#FFFFFF0C",
        border: `1px solid ${C.cream}22`,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        minWidth: 340,
      }}
    >
      <div
        style={{
          fontFamily: "var(--body)",
          fontSize: 20,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: C.gold,
          fontWeight: 700,
        }}
      >
        {lang}
      </div>
      <div style={{ fontFamily: "var(--display)", fontSize: 32, color: "#fff", marginTop: 8, fontWeight: 600 }}>
        {text}
      </div>
    </div>
  );
};

export const Languages: React.FC = () => (
  <AbsoluteFill>
    <Backdrop tone="dark" />

    <Sequence from={0} durationInFrames={200}>
      <AbsoluteFill style={{ padding: "150px 130px 90px", justifyContent: "center", gap: 30 }}>
        <Eyebrow text="No language left behind" delay={2} color="#8FC2F5" />
        <Line
          text="A warning you cannot read is not a warning."
          delay={10}
          size={62}
          display
          weight={700}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 22, maxWidth: 1660 }}>
          {PHRASES.map((p, i) => (
            <Chip key={p.lang} lang={p.lang} text={p.text} delay={46 + i * 11} />
          ))}
        </div>
      </AbsoluteFill>
    </Sequence>

    <Sequence from={200} durationInFrames={160}>
      <AbsoluteFill style={{ padding: "150px 140px 90px", justifyContent: "center", gap: 26 }}>
        <Eyebrow text="How it works" delay={2} color="#8FC2F5" />
        <Line
          text="Every alert, report and dashboard translates on the fly."
          delay={8}
          size={54}
          display
          weight={700}
        />
        <Line
          text="Live today in English, Kiswahili and French — with AI translation extending coverage to Africa's major languages, plus Arabic, Portuguese and beyond for global partners."
          delay={44}
          size={36}
          color={`${C.cream}CC`}
        />
        <Line
          text="Community volunteers refine local wording, so meaning survives translation."
          delay={90}
          size={36}
          color={`${C.cream}CC`}
        />
        <Line
          text="One platform. Many tongues. The same truth."
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

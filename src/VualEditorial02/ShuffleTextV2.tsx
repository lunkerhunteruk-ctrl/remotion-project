import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

// Cyberpunk character set — tech/sci-fi feel
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?<>[]{}=/\\|_~^*";

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const CyberChar: React.FC<{
  char: string;
  index: number;
  startFrame: number;
  shuffleDuration: number;
  glowColor: string;
  glowColor2: string;
}> = ({ char, index, startFrame, shuffleDuration, glowColor, glowColor2 }) => {
  const frame = useCurrentFrame();

  if (char === " ") return <span style={{ display: "inline-block", width: "0.4em" }}>{" "}</span>;

  const charStart = startFrame + index * 1.5; // faster stagger
  const elapsed = frame - charStart;

  if (elapsed < 0) {
    return (
      <span style={{ opacity: 0, display: "inline-block" }}>
        {char}
      </span>
    );
  }

  const resolved = elapsed >= shuffleDuration;
  const displayChar = resolved
    ? char.toUpperCase()
    : CHARS[Math.floor(seededRandom(index * 777 + frame * 13) * CHARS.length)];

  // Glitch: occasionally show wrong char even after resolved
  const glitchSeed = seededRandom(frame * 31 + index * 97);
  const isGlitching = resolved && glitchSeed > 0.97 && elapsed < shuffleDuration + 30;
  const finalChar = isGlitching
    ? CHARS[Math.floor(seededRandom(frame * 53 + index * 41) * CHARS.length)]
    : displayChar;

  const glowIntensity = resolved
    ? interpolate(elapsed - shuffleDuration, [0, 12], [1, 0.15], { extrapolateRight: "clamp" })
    : interpolate(elapsed % 4, [0, 2, 4], [0.5, 1, 0.5], { extrapolateRight: "clamp" });

  const opacity = interpolate(elapsed, [0, 2], [0, 1], { extrapolateRight: "clamp" });

  // Alternate glow colors for cyberpunk feel
  const activeGlow = isGlitching ? "#ff0040" : (index % 3 === 0 ? glowColor2 : glowColor);

  // Slight vertical jitter during shuffle
  const yOffset = resolved ? 0 : Math.sin(elapsed * 0.8 + index) * 1.5;

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        color: resolved && !isGlitching ? "#ffffff" : activeGlow,
        textShadow: `
          0 0 ${glowIntensity * 8}px ${activeGlow},
          0 0 ${glowIntensity * 20}px ${activeGlow}60,
          0 0 ${glowIntensity * 40}px ${activeGlow}20
        `,
        transform: `translateY(${yOffset}px)`,
        fontStyle: "italic",
      }}
    >
      {finalChar}
    </span>
  );
};

// Decorative bracket/line elements
const CyberDeco: React.FC<{
  startFrame: number;
  glowColor: string;
}> = ({ startFrame, glowColor }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  if (elapsed < 0) return null;

  const lineWidth = interpolate(elapsed, [0, 15], [0, 100], { extrapolateRight: "clamp" });
  const opacity = interpolate(elapsed, [0, 6, 140, 160], [0, 0.6, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, textAlign: "right" }}>
      {/* Top line */}
      <div
        style={{
          height: 1,
          width: `${lineWidth}%`,
          background: `linear-gradient(90deg, transparent, ${glowColor})`,
          marginLeft: "auto",
          marginBottom: 12,
        }}
      />
    </div>
  );
};

export const ShuffleTextV2: React.FC<{
  lines: string[];
  startFrame?: number;
  shuffleDuration?: number;
  glowColor?: string;
  glowColor2?: string;
  fontSize?: number;
  letterSpacing?: number;
  lineHeight?: number;
}> = ({
  lines,
  startFrame = 0,
  shuffleDuration = 14,
  glowColor = "#00ffff",
  glowColor2 = "#ff00ff",
  fontSize = 48,
  letterSpacing = 8,
  lineHeight = 1.5,
}) => {
  const frame = useCurrentFrame();
  let globalCharIndex = 0;

  // Overall fade out
  const fadeOut = interpolate(
    frame,
    [startFrame + 120, startFrame + 145],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div style={{ opacity: fadeOut }}>
      <CyberDeco startFrame={startFrame - 4} glowColor={glowColor} />
      <div
        style={{
          fontFamily: "'Impact', 'DIN Condensed', 'Arial Narrow', sans-serif",
          fontSize,
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing,
          lineHeight,
          textAlign: "right",
          textTransform: "uppercase",
          whiteSpace: "pre",
        }}
      >
        {lines.map((line, lineIdx) => {
          const lineChars = line.split("").map((char, charIdx) => {
            const ci = globalCharIndex++;
            return (
              <CyberChar
                key={`${lineIdx}-${charIdx}`}
                char={char}
                index={ci}
                startFrame={startFrame + lineIdx * 8}
                shuffleDuration={shuffleDuration}
                glowColor={glowColor}
                glowColor2={glowColor2}
              />
            );
          });
          return <div key={lineIdx}>{lineChars}</div>;
        })}
      </div>
      {/* Bottom deco line */}
      <div style={{ opacity: fadeOut }}>
        <CyberDeco startFrame={startFrame + 10} glowColor={glowColor2} />
      </div>
    </div>
  );
};

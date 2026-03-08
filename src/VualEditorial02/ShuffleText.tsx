import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

// Deterministic pseudo-random based on seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const ShuffleChar: React.FC<{
  char: string;
  index: number;
  startFrame: number;
  shuffleDuration: number; // frames to shuffle before resolving
  glowColor: string;
}> = ({ char, index, startFrame, shuffleDuration, glowColor }) => {
  const frame = useCurrentFrame();

  if (char === " " || char === "\n") return <span>{char}</span>;

  const charStart = startFrame + index * 2; // stagger: 2 frames per char
  const elapsed = frame - charStart;

  if (elapsed < 0) {
    // Not yet started - invisible
    return (
      <span style={{ opacity: 0, display: "inline-block", minWidth: char === " " ? "0.3em" : undefined }}>
        {char}
      </span>
    );
  }

  const resolved = elapsed >= shuffleDuration;
  const displayChar = resolved
    ? char
    : CHARS[Math.floor(seededRandom(index * 1000 + frame * 7) * CHARS.length)];

  // Glow effect during shuffle, fades after resolve
  const glowIntensity = resolved
    ? interpolate(elapsed - shuffleDuration, [0, 8], [1, 0], { extrapolateRight: "clamp" })
    : interpolate(elapsed, [0, shuffleDuration * 0.3], [0.3, 1], { extrapolateRight: "clamp" });

  const opacity = interpolate(elapsed, [0, 3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        color: resolved ? "#ffffff" : glowColor,
        textShadow: glowIntensity > 0.1
          ? `0 0 ${glowIntensity * 12}px ${glowColor}, 0 0 ${glowIntensity * 25}px ${glowColor}40`
          : "none",
        transition: "color 0.1s",
      }}
    >
      {displayChar}
    </span>
  );
};

export const ShuffleText: React.FC<{
  lines: string[];
  startFrame?: number;
  shuffleDuration?: number;
  glowColor?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: "left" | "right" | "center";
}> = ({
  lines,
  startFrame = 0,
  shuffleDuration = 10,
  glowColor = "#00d4ff",
  fontSize = 28,
  fontWeight = 300,
  letterSpacing = 3,
  lineHeight = 1.6,
  textAlign = "right",
}) => {
  let globalCharIndex = 0;

  return (
    <div
      style={{
        fontFamily: "'Courier New', 'SF Mono', monospace",
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight,
        textAlign,
        whiteSpace: "pre",
      }}
    >
      {lines.map((line, lineIdx) => {
        const lineChars = line.split("").map((char, charIdx) => {
          const ci = globalCharIndex++;
          return (
            <ShuffleChar
              key={`${lineIdx}-${charIdx}`}
              char={char}
              index={ci}
              startFrame={startFrame}
              shuffleDuration={shuffleDuration}
              glowColor={glowColor}
            />
          );
        });
        return (
          <div key={lineIdx}>
            {lineChars}
          </div>
        );
      })}
    </div>
  );
};

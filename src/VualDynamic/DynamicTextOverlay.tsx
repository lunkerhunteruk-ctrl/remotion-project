import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import type { VualDynamicProps, ShotConfig } from "./schema";

/**
 * Font family map for text overlays.
 */
const FONT_MAP: Record<string, string> = {
  impact: "'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif",
  "noto-sans": "'Noto Sans JP', 'Noto Sans', sans-serif",
  montserrat: "'Montserrat', 'Helvetica Neue', sans-serif",
};

/**
 * Position map for telop placement.
 */
const POSITION_MAP: Record<
  string,
  { top?: string; bottom?: string; left?: string; right?: string; textAlign: "left" | "right" | "center" }
> = {
  "top-left": { top: "60px", left: "60px", textAlign: "left" },
  "top-right": { top: "60px", right: "60px", textAlign: "right" },
  "bottom-left": { bottom: "80px", left: "60px", textAlign: "left" },
  "bottom-right": { bottom: "80px", right: "60px", textAlign: "right" },
  center: { top: "50%", left: "50%", textAlign: "center" },
};

// ── Slide Text ──────────────────────────────────────────

const SlideTextLine: React.FC<{
  text: string;
  startFrame: number;
  fromDirection: "left" | "right";
  fontSize: number;
  yOffset: number;
  fontFamily: string;
}> = ({ text, startFrame, fromDirection, fontSize, yOffset, fontFamily }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const elapsed = frame - startFrame;
  if (elapsed < -5) return null;

  const slideFrom = fromDirection === "left" ? -width : width;
  const x = interpolate(elapsed, [0, 18], [slideFrom, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(elapsed, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tracking = interpolate(elapsed, [10, 22], [2, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: yOffset,
        left: 0,
        right: 0,
        opacity,
        transform: `translateX(${x}px)`,
        fontFamily,
        fontSize,
        fontWeight: 900,
        fontStyle: "italic",
        letterSpacing: tracking,
        color: "#ffffff",
        textTransform: "uppercase",
        textAlign: fromDirection === "left" ? "left" : "right",
        padding: fromDirection === "left" ? "0 0 0 60px" : "0 60px 0 0",
        whiteSpace: "nowrap",
        textShadow: "2px 2px 0px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      {text}
    </div>
  );
};

// ── Shuffle Text ────────────────────────────────────────

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const ShuffleChar: React.FC<{
  char: string;
  index: number;
  startFrame: number;
  shuffleDuration: number;
  glowColor: string;
}> = ({ char, index, startFrame, shuffleDuration, glowColor }) => {
  const frame = useCurrentFrame();
  if (char === " ") return <span>{char}</span>;

  const charStart = startFrame + index * 2;
  const elapsed = frame - charStart;
  if (elapsed < 0) return <span style={{ opacity: 0 }}>{char}</span>;

  const resolved = elapsed >= shuffleDuration;
  const displayChar = resolved
    ? char
    : CHARS[Math.floor(seededRandom(index * 1000 + frame * 7) * CHARS.length)];

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
        textShadow:
          glowIntensity > 0.1
            ? `0 0 ${glowIntensity * 12}px ${glowColor}, 0 0 ${glowIntensity * 25}px ${glowColor}40`
            : "none",
      }}
    >
      {displayChar}
    </span>
  );
};

// ── Main Component ──────────────────────────────────────

export const DynamicTextOverlay: React.FC<{
  shot: ShotConfig;
  shotIndex: number;
  localStartFrame: number;
  durationFrames: number;
  textStyle: VualDynamicProps["textStyle"];
  textFont: VualDynamicProps["textFont"];
}> = ({ shot, shotIndex, localStartFrame, durationFrames, textStyle, textFont }) => {
  const frame = useCurrentFrame();
  const { height: canvasH, width: canvasW } = useVideoConfig();
  const fontFamily = FONT_MAP[textFont] || FONT_MAP.impact;

  if (!shot.telopText) return null;

  const pos = POSITION_MAP[shot.telopPosition || "bottom-left"];

  // Telop appears after 0.5s into the shot, fades out 0.5s before end
  const enterFrame = 12;
  const exitFrame = durationFrames - 12;

  const containerOpacity = interpolate(
    frame,
    [enterFrame, enterFrame + 8, exitFrame, exitFrame + 8],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (containerOpacity <= 0) return null;

  // Split telop into lines
  const lines = shot.telopText.split("\n").filter(Boolean);

  if (textStyle === "shuffle") {
    let globalIdx = 0;
    return (
      <div
        style={{
          position: "absolute",
          ...pos,
          ...(pos.textAlign === "center" ? { transform: "translate(-50%, -50%)" } : {}),
          opacity: containerOpacity,
          fontFamily: "'Courier New', 'SF Mono', monospace",
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: 4,
          lineHeight: 1.8,
          textAlign: pos.textAlign,
          whiteSpace: "pre",
        }}
      >
        {lines.map((line, lineIdx) => {
          const lineChars = line.split("").map((char, charIdx) => {
            const ci = globalIdx++;
            return (
              <ShuffleChar
                key={`${lineIdx}-${charIdx}`}
                char={char}
                index={ci}
                startFrame={enterFrame}
                shuffleDuration={10}
                glowColor="#00d4ff"
              />
            );
          });
          return <div key={lineIdx}>{lineChars}</div>;
        })}
      </div>
    );
  }
  const sc = canvasW / 1920;

  if (textStyle === "slide") {
    const baseY = pos.bottom ? canvasH - 80 * sc - lines.length * 70 * sc : 60 * sc;
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", opacity: containerOpacity }}>
        {lines.map((line, i) => (
          <SlideTextLine
            key={i}
            text={line}
            startFrame={enterFrame + i * 10}
            fromDirection={i % 2 === 0 ? "left" : "right"}
            fontSize={48}
            yOffset={baseY + i * 70}
            fontFamily={fontFamily}
          />
        ))}
      </div>
    );
  }

  // minimal: simple fade-in text
  return (
    <div
      style={{
        position: "absolute",
        ...pos,
        ...(pos.textAlign === "center" ? { transform: "translate(-50%, -50%)" } : {}),
        opacity: containerOpacity,
        fontFamily,
        fontSize: 36,
        fontWeight: 600,
        color: "#ffffff",
        letterSpacing: 6,
        textTransform: "uppercase",
        textShadow: "0 2px 8px rgba(0,0,0,0.6)",
        lineHeight: 1.6,
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
};

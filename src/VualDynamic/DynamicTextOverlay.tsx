import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import type { VualDynamicProps, ShotConfig } from "./schema";
import { FONT_MAP } from "./fonts";

/**
 * Position map for telop placement (base values at 1920px width).
 */
const POSITION_BASE = {
  "top-left": { top: 60, left: 60, textAlign: "left" as const },
  "top-right": { top: 60, right: 60, textAlign: "right" as const },
  "bottom-left": { bottom: 80, left: 60, textAlign: "left" as const },
  "bottom-right": { bottom: 80, right: 60, textAlign: "right" as const },
  center: { top: null, left: null, textAlign: "center" as const },
};

// ── Slide Text ──────────────────────────────────────────

const SlideTextLine: React.FC<{
  text: string;
  startFrame: number;
  fromDirection: "left" | "right";
  fontSize: number;
  yOffset: number;
  fontFamily: string;
  s: number;
}> = ({ text, startFrame, fromDirection, fontSize, yOffset, fontFamily, s }) => {
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
  const tracking = interpolate(elapsed, [10, 22], [2 * s, 10 * s], {
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
        fontSize: fontSize * s,
        fontWeight: 900,
        fontStyle: "italic",
        letterSpacing: tracking,
        color: "#ffffff",
        textTransform: "uppercase",
        textAlign: fromDirection === "left" ? "left" : "right",
        padding: fromDirection === "left" ? `0 0 0 ${60 * s}px` : `0 ${60 * s}px 0 0`,
        whiteSpace: "nowrap",
        textShadow: `${2 * s}px ${2 * s}px 0px rgba(0,0,0,0.8), 0 0 ${20 * s}px rgba(0,0,0,0.3)`,
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
  s: number;
}> = ({ char, index, startFrame, shuffleDuration, glowColor, s }) => {
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
            ? `0 0 ${glowIntensity * 12 * s}px ${glowColor}, 0 0 ${glowIntensity * 25 * s}px ${glowColor}40`
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
  const s = canvasW / 1920;

  if (!shot.telopText) return null;

  const posBase = POSITION_BASE[shot.telopPosition || "bottom-left"];

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
    // Compute scaled position
    const posStyle: React.CSSProperties = {};
    if (posBase.textAlign === "center") {
      posStyle.top = "50%";
      posStyle.left = "50%";
      posStyle.transform = "translate(-50%, -50%)";
    } else {
      if ("top" in posBase && posBase.top != null) posStyle.top = posBase.top * s;
      if ("bottom" in posBase && posBase.bottom != null) posStyle.bottom = posBase.bottom * s;
      if ("left" in posBase && posBase.left != null) posStyle.left = posBase.left * s;
      if ("right" in posBase && posBase.right != null) posStyle.right = posBase.right * s;
    }

    let globalIdx = 0;
    return (
      <div
        style={{
          position: "absolute",
          ...posStyle,
          opacity: containerOpacity,
          fontFamily: "'Courier New', 'SF Mono', monospace",
          fontSize: 28 * s,
          fontWeight: 400,
          letterSpacing: 4 * s,
          lineHeight: 1.8,
          textAlign: posBase.textAlign,
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
                s={s}
              />
            );
          });
          return <div key={lineIdx}>{lineChars}</div>;
        })}
      </div>
    );
  }

  if (textStyle === "slide") {
    const baseY = posBase.bottom != null
      ? canvasH - posBase.bottom * s - lines.length * 70 * s
      : (posBase.top ?? 60) * s;
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", opacity: containerOpacity }}>
        {lines.map((line, i) => (
          <SlideTextLine
            key={i}
            text={line}
            startFrame={enterFrame + i * 10}
            fromDirection={i % 2 === 0 ? "left" : "right"}
            fontSize={48}
            yOffset={baseY + i * 70 * s}
            fontFamily={fontFamily}
            s={s}
          />
        ))}
      </div>
    );
  }

  // minimal: simple fade-in text
  const minPosStyle: React.CSSProperties = {};
  if (posBase.textAlign === "center") {
    minPosStyle.top = "50%";
    minPosStyle.left = "50%";
    minPosStyle.transform = "translate(-50%, -50%)";
  } else {
    if ("top" in posBase && posBase.top != null) minPosStyle.top = posBase.top * s;
    if ("bottom" in posBase && posBase.bottom != null) minPosStyle.bottom = posBase.bottom * s;
    if ("left" in posBase && posBase.left != null) minPosStyle.left = posBase.left * s;
    if ("right" in posBase && posBase.right != null) minPosStyle.right = posBase.right * s;
  }

  return (
    <div
      style={{
        position: "absolute",
        ...minPosStyle,
        opacity: containerOpacity,
        fontFamily,
        fontSize: 36 * s,
        fontWeight: 600,
        color: "#ffffff",
        letterSpacing: 6 * s,
        textTransform: "uppercase",
        textShadow: `0 ${2 * s}px ${8 * s}px rgba(0,0,0,0.6)`,
        lineHeight: 1.6,
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
};

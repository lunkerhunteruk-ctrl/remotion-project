import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import type { VualDynamicProps } from "./schema";
import { FONT_MAP } from "./fonts";

const FPS = 24;

// Total display duration: ~12 seconds
const DISPLAY_DURATION = FPS * 12; // 288 frames
const ENTER_START = FPS * 0.5; // appear 0.5s into the shot
const EXIT_START = ENTER_START + DISPLAY_DURATION; // start exit at ~12.5s

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

/**
 * Metadata overlay for date & location text.
 * Positioned top-right. Same text style as telop (DynamicTextOverlay).
 * Appears ~0.5s in, stays ~12s, then exits with motion.
 * All pixel values scaled by width/1920 for AR consistency.
 */
export const MetadataOverlay: React.FC<{
  dateText?: string;
  locationText?: string;
  durationFrames: number;
  textStyle: VualDynamicProps["textStyle"];
  textFont: VualDynamicProps["textFont"];
}> = ({ dateText, locationText, durationFrames, textStyle, textFont }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const fontFamily = FONT_MAP[textFont] || FONT_MAP.impact;
  const s = width / 1920;

  if (!dateText && !locationText) return null;

  // Clamp exit to not exceed shot duration
  const exitStart = Math.min(EXIT_START, durationFrames - FPS * 1);

  if (textStyle === "slide") {
    return (
      <SlideMetadata
        dateText={dateText}
        locationText={locationText}
        enterStart={ENTER_START}
        exitStart={exitStart}
        fontFamily={fontFamily}
        s={s}
      />
    );
  }

  if (textStyle === "shuffle") {
    return (
      <ShuffleMetadata
        dateText={dateText}
        locationText={locationText}
        enterStart={ENTER_START}
        exitStart={exitStart}
        s={s}
      />
    );
  }

  // minimal
  return (
    <MinimalMetadata
      dateText={dateText}
      locationText={locationText}
      enterStart={ENTER_START}
      exitStart={exitStart}
      fontFamily={fontFamily}
      s={s}
    />
  );
};

// ── Slide variant ──────────────────────────────────────

const SlideMetadata: React.FC<{
  dateText?: string;
  locationText?: string;
  enterStart: number;
  exitStart: number;
  fontFamily: string;
  s: number;
}> = ({ dateText, locationText, enterStart, exitStart, fontFamily, s }) => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {dateText && (
        <SlideMetaLine
          text={dateText}
          enterFrame={enterStart}
          exitFrame={exitStart}
          yOffset={60 * s}
          fontFamily={fontFamily}
          s={s}
        />
      )}
      {locationText && (
        <SlideMetaLine
          text={locationText}
          enterFrame={enterStart + 10}
          exitFrame={exitStart + 6}
          yOffset={dateText ? 130 * s : 60 * s}
          fontFamily={fontFamily}
          s={s}
        />
      )}
    </div>
  );
};

const SlideMetaLine: React.FC<{
  text: string;
  enterFrame: number;
  exitFrame: number;
  yOffset: number;
  fontFamily: string;
  s: number;
}> = ({ text, enterFrame, exitFrame, yOffset, fontFamily, s }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const enterElapsed = frame - enterFrame;
  const exitElapsed = frame - exitFrame;

  if (enterElapsed < -5) return null;
  if (exitElapsed > 18) return null;

  const slideFrom = width; // always from right

  // Enter: slide in from right
  const enterX = interpolate(enterElapsed, [0, 18], [slideFrom, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const enterOpacity = interpolate(enterElapsed, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tracking animation (same as telop)
  const tracking = interpolate(enterElapsed, [10, 22], [2 * s, 10 * s], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Exit: slide out to right
  const exitX = exitElapsed > 0
    ? interpolate(exitElapsed, [0, 18], [0, slideFrom], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.cubic),
      })
    : 0;
  const exitOpacity = exitElapsed > 0
    ? interpolate(exitElapsed, [0, 12], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const x = enterElapsed < 18 ? enterX : exitX;
  const opacity = Math.min(enterOpacity, exitOpacity);

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
        fontSize: 48 * s,
        fontWeight: 900,
        fontStyle: "italic",
        letterSpacing: tracking,
        color: "#ffffff",
        textTransform: "uppercase",
        textAlign: "right",
        padding: `0 ${60 * s}px 0 0`,
        whiteSpace: "nowrap",
        textShadow: `${2 * s}px ${2 * s}px 0px rgba(0,0,0,0.8), 0 0 ${20 * s}px rgba(0,0,0,0.3)`,
      }}
    >
      {text}
    </div>
  );
};

// ── Shuffle variant ────────────────────────────────────

const ShuffleMetadata: React.FC<{
  dateText?: string;
  locationText?: string;
  enterStart: number;
  exitStart: number;
  s: number;
}> = ({ dateText, locationText, enterStart, exitStart, s }) => {
  const frame = useCurrentFrame();

  const exitElapsed = frame - exitStart;
  const exitOpacity = exitElapsed > 0
    ? interpolate(exitElapsed, [0, 18], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  if (exitOpacity <= 0) return null;

  let globalIdx = 0;
  const lines: string[] = [];
  if (dateText) lines.push(dateText);
  if (locationText) lines.push(locationText);

  return (
    <div
      style={{
        position: "absolute",
        top: 60 * s,
        right: 60 * s,
        opacity: exitOpacity,
        textAlign: "right",
      }}
    >
      {lines.map((line, lineIdx) => {
        const lineChars = line.split("").map((char, charIdx) => {
          const ci = globalIdx++;
          return (
            <ShuffleMeta
              key={`${lineIdx}-${charIdx}`}
              char={char}
              index={ci}
              startFrame={enterStart + lineIdx * 8}
              shuffleDuration={10}
              s={s}
            />
          );
        });
        return (
          <div
            key={lineIdx}
            style={{
              fontFamily: "'Courier New', 'SF Mono', monospace",
              fontSize: 28 * s,
              fontWeight: 400,
              letterSpacing: 4 * s,
              color: "#ffffff",
              textTransform: "uppercase",
              lineHeight: 1.8,
              whiteSpace: "pre",
            }}
          >
            {lineChars}
          </div>
        );
      })}
    </div>
  );
};

const ShuffleMeta: React.FC<{
  char: string;
  index: number;
  startFrame: number;
  shuffleDuration: number;
  s: number;
}> = ({ char, index, startFrame, shuffleDuration, s }) => {
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
        color: resolved ? "#ffffff" : "#00d4ff",
        textShadow:
          glowIntensity > 0.1
            ? `0 0 ${glowIntensity * 12 * s}px #00d4ff, 0 0 ${glowIntensity * 25 * s}px #00d4ff40`
            : "none",
      }}
    >
      {displayChar}
    </span>
  );
};

// ── Minimal variant ────────────────────────────────────

const MinimalMetadata: React.FC<{
  dateText?: string;
  locationText?: string;
  enterStart: number;
  exitStart: number;
  fontFamily: string;
  s: number;
}> = ({ dateText, locationText, enterStart, exitStart, fontFamily, s }) => {
  const frame = useCurrentFrame();

  const enterElapsed = frame - enterStart;
  const exitElapsed = frame - exitStart;

  const enterOpacity = interpolate(enterElapsed, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = exitElapsed > 0
    ? interpolate(exitElapsed, [0, 12], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const opacity = Math.min(enterOpacity, exitOpacity);
  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 60 * s,
        right: 60 * s,
        opacity,
        textAlign: "right",
      }}
    >
      {dateText && (
        <div
          style={{
            fontFamily,
            fontSize: 36 * s,
            fontWeight: 600,
            letterSpacing: 6 * s,
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: `0 ${2 * s}px ${8 * s}px rgba(0,0,0,0.6)`,
          }}
        >
          {dateText}
        </div>
      )}
      {locationText && (
        <div
          style={{
            fontFamily,
            fontSize: 36 * s,
            fontWeight: 600,
            letterSpacing: 6 * s,
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: `0 ${2 * s}px ${8 * s}px rgba(0,0,0,0.6)`,
            marginTop: 8 * s,
          }}
        >
          {locationText}
        </div>
      )}
    </div>
  );
};

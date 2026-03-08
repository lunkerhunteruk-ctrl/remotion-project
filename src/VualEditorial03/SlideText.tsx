import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

const SlideTextLine: React.FC<{
  text: string;
  startFrame: number;
  fromDirection: "left" | "right";
  fontSize: number;
  yOffset: number;
}> = ({ text, startFrame, fromDirection, fontSize, yOffset }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  if (elapsed < -5) return null;

  // Slide in
  const slideFrom = fromDirection === "left" ? -1200 : 1200;
  const x = interpolate(elapsed, [0, 18], [slideFrom, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Opacity
  const opacity = interpolate(elapsed, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle tracking animation (letter-spacing expands slightly on arrival)
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
        fontFamily: "'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif",
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

// Decorative horizontal line that slides in
const SlideLine: React.FC<{
  startFrame: number;
  fromDirection: "left" | "right";
  yOffset: number;
  color: string;
}> = ({ startFrame, fromDirection, yOffset, color }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  if (elapsed < 0) return null;

  const width = interpolate(elapsed, [0, 20], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(elapsed, [0, 6], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: yOffset,
        left: fromDirection === "left" ? 60 : "auto",
        right: fromDirection === "right" ? 60 : "auto",
        width: `${width * 3}px`,
        height: 2,
        background: color,
        opacity,
      }}
    />
  );
};

export const SlideText: React.FC<{
  lines: { text: string; from: "left" | "right" }[];
  startFrame?: number;
  fontSize?: number;
  lineSpacing?: number;
  baseY?: number;
  fadeOutStart?: number;
  fadeOutDuration?: number;
}> = ({
  lines,
  startFrame = 0,
  fontSize = 52,
  lineSpacing = 70,
  baseY = 60,
  fadeOutStart = 160,
  fadeOutDuration = 15,
}) => {
  const frame = useCurrentFrame();

  // Overall fade out
  const fadeOut = interpolate(
    frame,
    [startFrame + fadeOutStart, startFrame + fadeOutStart + fadeOutDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", opacity: fadeOut }}>
      {/* Top decorative line */}
      <SlideLine
        startFrame={startFrame}
        fromDirection={lines[0]?.from || "left"}
        yOffset={baseY - 12}
        color="#ffffff"
      />

      {lines.map((line, i) => (
        <SlideTextLine
          key={i}
          text={line.text}
          startFrame={startFrame + i * 10}
          fromDirection={line.from}
          fontSize={fontSize}
          yOffset={baseY + i * lineSpacing}
        />
      ))}

      {/* Bottom decorative line */}
      <SlideLine
        startFrame={startFrame + lines.length * 10 + 5}
        fromDirection={lines[lines.length - 1]?.from || "right"}
        yOffset={baseY + lines.length * lineSpacing + 8}
        color="#ffffff"
      />
    </div>
  );
};

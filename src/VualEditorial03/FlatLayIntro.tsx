import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  Img,
  staticFile,
} from "remotion";

const FPS = 24;

// 5 seconds intro
export const FLATLAY_INTRO_DURATION = FPS * 5; // 120 frames

// 2x2 grid layout
const CELL_SIZE = 420;
const GAP = 40;
const GRID_W = CELL_SIZE * 2 + GAP;
const GRID_H = CELL_SIZE * 2 + GAP;
const GRID_LEFT = (1920 - GRID_W) / 2;
const GRID_TOP = (1080 - GRID_H) / 2;

const items = [
  {
    src: staticFile("v03/jacket.png"),
    label: "jacket",
    enterFrame: 4,
    col: 0,
    row: 0,
    slideFrom: "left" as const,
  },
  {
    src: staticFile("v03/sunglass.png"),
    label: "sunglass",
    enterFrame: 14,
    col: 1,
    row: 0,
    slideFrom: "right" as const,
  },
  {
    src: staticFile("v03/skirt.png"),
    label: "skirt",
    enterFrame: 24,
    col: 0,
    row: 1,
    slideFrom: "left" as const,
  },
  {
    src: staticFile("v03/sandal.png"),
    label: "sandal",
    enterFrame: 34,
    col: 1,
    row: 1,
    slideFrom: "right" as const,
  },
];

const FlatLayItem: React.FC<{
  src: string;
  enterFrame: number;
  col: number;
  row: number;
  slideFrom: "left" | "right";
}> = ({ src, enterFrame, col, row, slideFrom }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - enterFrame;

  if (elapsed < -2) return null;

  const animDuration = 12;
  const finalX = GRID_LEFT + col * (CELL_SIZE + GAP);
  const finalY = GRID_TOP + row * (CELL_SIZE + GAP);
  const startX = slideFrom === "left" ? -CELL_SIZE - 100 : 1920 + 100;

  const x = interpolate(elapsed, [0, animDuration], [startX, finalX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(elapsed, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(elapsed, [0, animDuration], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: finalY,
        width: CELL_SIZE,
        height: CELL_SIZE,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img
        src={src}
        style={{
          maxWidth: CELL_SIZE - 20,
          maxHeight: CELL_SIZE - 20,
          objectFit: "contain",
        }}
      />
    </div>
  );
};

export const FlatLayIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // Background
  const bgOpacity = interpolate(frame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text overlay appears after all items landed (~frame 48 = 2s)
  // Dark overlay behind text
  const textEnterFrame = 50;
  const textElapsed = frame - textEnterFrame;

  const overlayOpacity = interpolate(textElapsed, [0, 8], [0, 0.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(textElapsed, [2, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text scale: starts big, settles
  const textScale = interpolate(textElapsed, [2, 16], [1.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Letter spacing tightens
  const tracking = interpolate(textElapsed, [2, 18], [40, 14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Decorative lines expand from center
  const lineWidth = interpolate(textElapsed, [10, 24], [0, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // White flash at the end (starts at ~4s = frame 96)
  const whiteFlashStart = FPS * 4;
  const whiteFlash = interpolate(
    frame,
    [whiteFlashStart, whiteFlashStart + 6, FLATLAY_INTRO_DURATION],
    [0, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* White background */}
      <AbsoluteFill
        style={{ backgroundColor: "#ffffff", opacity: bgOpacity }}
      />

      {/* Items in 2x2 grid */}
      {items.map((item) => (
        <FlatLayItem key={item.label} {...item} />
      ))}

      {/* Dark overlay on top of items */}
      {textElapsed > -2 && (
        <AbsoluteFill
          style={{ backgroundColor: "#0a0a0a", opacity: overlayOpacity }}
        />
      )}

      {/* "FROM FLATLAY TO RUNWAY" text centered */}
      {textElapsed > 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: textOpacity,
          }}
        >
          {/* Top line */}
          <div
            style={{
              width: lineWidth,
              height: 2,
              backgroundColor: "rgba(255,255,255,0.5)",
              marginBottom: 28,
            }}
          />
          <div
            style={{
              fontFamily:
                "'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif",
              fontSize: 64,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: tracking,
              color: "#ffffff",
              textTransform: "uppercase",
              transform: `scale(${textScale})`,
              textShadow: "0 0 40px rgba(255,255,255,0.2)",
            }}
          >
            FROM FLATLAY TO RUNWAY
          </div>
          {/* Bottom line */}
          <div
            style={{
              width: lineWidth,
              height: 2,
              backgroundColor: "rgba(255,255,255,0.5)",
              marginTop: 28,
            }}
          />
        </AbsoluteFill>
      )}

      {/* White flash transition */}
      <AbsoluteFill
        style={{ backgroundColor: "#ffffff", opacity: whiteFlash }}
      />
    </AbsoluteFill>
  );
};

import React from "react";
import {
  useCurrentFrame,
  interpolate,
  Easing,
  Img,
  staticFile,
} from "remotion";
import { getFontFamily } from "./fonts";
import { useContentSize } from "./ContentSizeContext";

const FPS = 24;

/** Duration of the intro by style */
export const INTRO_DURATION_MAP = {
  flatlay: FPS * 5,     // 120 frames (5s)
  "text-only": FPS * 2.5, // 60 frames (2.5s)
} as const;

/** Default intro duration (flatlay) for backward compatibility */
export const INTRO_DURATION_FRAMES = INTRO_DURATION_MAP.flatlay;

// ─── Flatlay Intro ───────────────────────────────────────────────────────────

const flatLayItems = [
  { src: staticFile("v03/jacket.png"), label: "jacket", enterFrame: 4, col: 0, row: 0, slideFrom: "left" as const },
  { src: staticFile("v03/sunglass.png"), label: "sunglass", enterFrame: 14, col: 1, row: 0, slideFrom: "right" as const },
  { src: staticFile("v03/skirt.png"), label: "skirt", enterFrame: 24, col: 0, row: 1, slideFrom: "left" as const },
  { src: staticFile("v03/sandal.png"), label: "sandal", enterFrame: 34, col: 1, row: 1, slideFrom: "right" as const },
];

const FlatLayItem: React.FC<{
  src: string;
  enterFrame: number;
  col: number;
  row: number;
  slideFrom: "left" | "right";
}> = ({ src, enterFrame, col, row, slideFrom }) => {
  const frame = useCurrentFrame();
  const { width, height } = useContentSize();
  const elapsed = frame - enterFrame;

  if (elapsed < -2) return null;

  // Scale grid to canvas size
  const cellSize = Math.min(width, height) * 0.35;
  const gap = cellSize * 0.1;
  const gridW = cellSize * 2 + gap;
  const gridH = cellSize * 2 + gap;
  const gridLeft = (width - gridW) / 2;
  const gridTop = (height - gridH) / 2;

  const animDuration = 12;
  const finalX = gridLeft + col * (cellSize + gap);
  const finalY = gridTop + row * (cellSize + gap);
  const startX = slideFrom === "left" ? -cellSize - 100 : width + 100;

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
        width: cellSize,
        height: cellSize,
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
          maxWidth: cellSize - 20,
          maxHeight: cellSize - 20,
          objectFit: "contain",
        }}
      />
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const DynamicIntro: React.FC<{
  introStyle: "flatlay" | "text-only";
  introText?: string;
  textFont?: string;
  flatLayImageUrls?: string[];
}> = ({
  introStyle,
  introText = "FROM FLATLAY TO RUNWAY",
  textFont = "impact",
  flatLayImageUrls,
}) => {
  if (introStyle === "flatlay") {
    return (
      <FlatLayIntroContent
        introText={introText}
        textFont={textFont}
        flatLayImageUrls={flatLayImageUrls}
      />
    );
  }

  return (
    <TextOnlyIntro
      introText={introText}
      textFont={textFont}
    />
  );
};

// ─── Flatlay Intro ───────────────────────────────────────────────────────────

const FlatLayIntroContent: React.FC<{
  introText: string;
  textFont: string;
  flatLayImageUrls?: string[];
}> = ({ introText, textFont, flatLayImageUrls }) => {
  const frame = useCurrentFrame();
  const { width } = useContentSize();
  const fontFamily = getFontFamily(textFont);
  const s = width / 1920; // scale factor relative to 1920 base

  const bgOpacity = interpolate(frame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text overlay after items land (~frame 50)
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

  const textScale = interpolate(textElapsed, [2, 16], [1.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const tracking = interpolate(textElapsed, [2, 18], [40, 14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineWidth = interpolate(textElapsed, [10, 24], [0, 500 * s], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // White flash at the end
  const whiteFlashStart = FPS * 4;
  const whiteFlash = interpolate(
    frame,
    [whiteFlashStart, whiteFlashStart + 6, INTRO_DURATION_FRAMES],
    [0, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fill: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" };

  return (
    <div style={{ ...fill, backgroundColor: "transparent" }}>
      <div style={{ ...fill, backgroundColor: "#ffffff", opacity: bgOpacity }} />

      {flatLayItems.map((item, idx) => (
        <FlatLayItem
          key={item.label}
          {...item}
          src={flatLayImageUrls?.[idx] || item.src}
        />
      ))}

      {textElapsed > -2 && (
        <div style={{ ...fill, backgroundColor: "#0a0a0a", opacity: overlayOpacity }} />
      )}

      {textElapsed > 0 && (
        <div
          style={{
            ...fill,
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
              marginBottom: 28 * s,
            }}
          />

          {/* Main intro text */}
          <div
            style={{
              fontFamily,
              fontSize: 64 * s,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: tracking * s,
              color: "#ffffff",
              textTransform: "uppercase",
              transform: `scale(${textScale})`,
              textShadow: "0 0 40px rgba(255,255,255,0.2)",
              textAlign: "center",
              padding: `0 ${60 * s}px`,
            }}
          >
            {introText}
          </div>

          {/* Bottom line */}
          <div
            style={{
              width: lineWidth,
              height: 2,
              backgroundColor: "rgba(255,255,255,0.5)",
              marginTop: 28 * s,
            }}
          />
        </div>
      )}

      {/* White flash transition */}
      <div style={{ ...fill, backgroundColor: "#ffffff", opacity: whiteFlash }} />
    </div>
  );
};

// ─── Text Only Intro ─────────────────────────────────────────────────────────

const TextOnlyIntro: React.FC<{
  introText: string;
  textFont: string;
}> = ({ introText, textFont }) => {
  const frame = useCurrentFrame();
  const { width } = useContentSize();
  const fontFamily = getFontFamily(textFont);
  const s = width / 1920;

  const dur = INTRO_DURATION_MAP["text-only"]; // 60 frames (2.5s)

  // Fade in background
  const bgOpacity = interpolate(frame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Main text slides up
  const mainTextEnter = 4;
  const mainElapsed = frame - mainTextEnter;

  const mainOpacity = interpolate(mainElapsed, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mainY = interpolate(mainElapsed, [0, 8], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const mainTracking = interpolate(mainElapsed, [0, 12], [30, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Decorative line
  const lineEnter = 10;
  const lineElapsed = frame - lineEnter;
  const lineWidth = interpolate(lineElapsed, [0, 10], [0, 400 * s], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // White flash at the end
  const whiteFlashStart = dur - 12; // ~0.5s before end
  const whiteFlash = interpolate(
    frame,
    [whiteFlashStart, whiteFlashStart + 6, dur],
    [0, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fill: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" };

  return (
    <div style={{ ...fill, backgroundColor: "transparent" }}>
      {/* Dark background */}
      <div style={{ ...fill, backgroundColor: "#0a0a0a", opacity: bgOpacity }} />

      <div
        style={{
          ...fill,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Main intro text */}
        <div
          style={{
            opacity: mainOpacity,
            transform: `translateY(${mainY * s}px)`,
            fontFamily,
            fontSize: 64 * s,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: mainTracking * s,
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: "0 0 40px rgba(255,255,255,0.15)",
            textAlign: "center",
            padding: `0 ${60 * s}px`,
          }}
        >
          {introText}
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: "rgba(255,255,255,0.4)",
            marginTop: 28 * s,
            marginBottom: 28 * s,
          }}
        />

      </div>

      {/* White flash transition */}
      <div style={{ ...fill, backgroundColor: "#ffffff", opacity: whiteFlash }} />
    </div>
  );
};

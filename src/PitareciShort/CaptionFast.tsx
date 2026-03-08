import React from "react";
import { useCurrentFrame, spring, useVideoConfig, staticFile, Img } from "remotion";

interface CaptionFastProps {
  text: string;
  style?: "impact" | "endcard";
  clickFrame?: number; // Frame for search click animation
  position?: "top" | "bottom"; // Caption position
}

export const CaptionFast: React.FC<CaptionFastProps> = ({
  text,
  style = "impact",
  clickFrame,
  position = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Search field click animation
  const getSearchFieldScale = () => {
    if (!clickFrame) return 1;
    const relativeFrame = frame - clickFrame;
    if (relativeFrame < 0 || relativeFrame > 8) return 1;
    // Press down then release: 1 -> 0.92 -> 1
    if (relativeFrame <= 3) {
      return 1 - (relativeFrame / 3) * 0.08; // 1 -> 0.92
    }
    return 0.92 + ((relativeFrame - 3) / 5) * 0.08; // 0.92 -> 1
  };

  const getSearchFieldBgColor = () => {
    if (!clickFrame) return "#FFFFFF";
    const relativeFrame = frame - clickFrame;
    if (relativeFrame >= 0 && relativeFrame <= 4) {
      return "#E8E8E8"; // Slightly darker when pressed
    }
    return "#FFFFFF";
  };

  const searchFieldScale = getSearchFieldScale();
  const searchFieldBgColor = getSearchFieldBgColor();

  // Ripple effect inside search field
  const getRippleStyle = () => {
    if (!clickFrame) return null;
    const relativeFrame = frame - clickFrame;
    if (relativeFrame < 0 || relativeFrame > 15) return null;

    const progress = relativeFrame / 15;
    const size = progress * 400; // Expands to 400px
    const opacity = (1 - progress) * 0.4;

    return {
      position: "absolute" as const,
      left: "50%",
      top: "50%",
      width: size,
      height: size,
      marginLeft: -size / 2,
      marginTop: -size / 2,
      borderRadius: "50%",
      backgroundColor: "#5A8F7B",
      opacity,
      pointerEvents: "none" as const,
    };
  };

  const rippleStyle = getRippleStyle();

  // Delay for search row in endcard (appears after caption)
  const searchRowDelay = 17; // frames after caption appears
  const showSearchRow = frame >= searchRowDelay;
  const searchRowPopIn = spring({
    frame: Math.max(0, frame - searchRowDelay),
    fps,
    config: {
      damping: 8,
      stiffness: 300,
      mass: 0.4,
    },
  });
  const searchRowScale = 0.1 + searchRowPopIn * 0.9;
  const searchRowOpacity = Math.min(1, searchRowPopIn * 1.5);

  // Bouncy spring animation - "ドンッ！" effect (stronger bounce)
  const popIn = spring({
    frame,
    fps,
    config: {
      damping: 8,
      stiffness: 300,
      mass: 0.4,
    },
  });

  const scale = 0.1 + popIn * 0.9; // Start smaller, bigger pop effect
  const opacity = Math.min(1, popIn * 1.5);

  // Split text by newlines
  const lines = text.split("\n");

  if (style === "endcard") {
    // New structure:
    // First line: 何気ない食卓も、物語になる。
    // Second line: App Store badge + ピタレシ + おいしいを記録する
    const firstLine = lines[0]; // 何気ない食卓も、物語になる。

    return (
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        {/* First row - App Store + ピタレシ + おいしいを記録する (delayed) */}
        {showSearchRow && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            transform: `scale(${searchRowScale})`,
            opacity: searchRowOpacity,
          }}
        >
          {/* App Store badge */}
          <Img
            src={staticFile("/images/appstore-badge.svg")}
            style={{
              height: 56,
              width: "auto",
            }}
          />

          {/* ピタレシ app name badge */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              backgroundColor: searchFieldBgColor,
              borderRadius: 12,
              padding: "10px 20px",
              transform: `scale(${searchFieldScale})`,
              transition: "background-color 0.05s",
              boxShadow: searchFieldScale < 1 ? "inset 0 2px 4px rgba(0,0,0,0.1)" : "0 4px 12px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            {/* Ripple effect */}
            {rippleStyle && <div style={rippleStyle} />}
            <span
              style={{
                fontSize: 36,
                color: "#5A8F7B",
                fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
                fontWeight: 900,
                letterSpacing: 2,
                position: "relative",
                zIndex: 1,
                whiteSpace: "nowrap",
              }}
            >
              ピタレシ
            </span>
          </div>

          {/* おいしいを記録する text */}
          <p
            style={{
              color: "#FFFFFF",
              fontSize: 32,
              fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
              fontWeight: 900,
              margin: 0,
              letterSpacing: 1,
              whiteSpace: "nowrap",
              textShadow: "2px 2px 0 #5A8F7B, -1px -1px 0 #2d2d2d, 1px -1px 0 #2d2d2d, -1px 1px 0 #2d2d2d",
            }}
          >
            おいしいを、記録する
          </p>
        </div>
        )}

        {/* Second row - 何気ない食卓も、物語になる。 (caption) */}
        <div
          style={{
            backgroundColor: "rgba(45, 45, 45, 0.92)",
            padding: "16px 32px",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <p
            style={{
              color: "#FFFFFF",
              fontSize: 44,
              fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
              fontWeight: 900,
              margin: 0,
              textAlign: "center",
              letterSpacing: 2,
              whiteSpace: "nowrap",
              textShadow: `
                3px 3px 0 #5A8F7B,
                -1px -1px 0 #2d2d2d,
                1px -1px 0 #2d2d2d,
                -1px 1px 0 #2d2d2d,
                1px 1px 0 #2d2d2d,
                0 4px 8px rgba(0,0,0,0.4)
              `,
            }}
          >
            {firstLine}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        ...(position === "top" ? { top: 120 } : { bottom: 200 }),
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 24px",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(45, 45, 45, 0.92)",
          padding: "16px 32px",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              color: "#FFFFFF",
              fontSize: 44,
              fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
              fontWeight: 900,
              margin: 0,
              textAlign: "center",
              letterSpacing: 2,
              whiteSpace: "nowrap",
              // Green shadow matching border
              textShadow: `
                3px 3px 0 #5A8F7B,
                -1px -1px 0 #2d2d2d,
                1px -1px 0 #2d2d2d,
                -1px 1px 0 #2d2d2d,
                1px 1px 0 #2d2d2d,
                0 4px 8px rgba(0,0,0,0.4)
              `,
              lineHeight: 1.4,
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

// Fast ripple effect for quick taps
interface FastRippleProps {
  x: number;
  y: number;
  triggerFrame: number;
}

export const FastRipple: React.FC<FastRippleProps> = ({ x, y, triggerFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - triggerFrame;
  const duration = 12; // Faster ripple

  if (relativeFrame < 0 || relativeFrame > duration) {
    return null;
  }

  const progress = relativeFrame / duration;

  // Quick expanding rings
  const rings = [0, 0.2];

  return (
    <>
      {rings.map((delay, index) => {
        const ringProgress = Math.max(0, (progress - delay) / (1 - delay));
        if (ringProgress <= 0 || ringProgress > 1) return null;

        const radius = ringProgress * 60;
        const opacity = (1 - ringProgress) * 0.8;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x - radius,
              top: y - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: "50%",
              border: `3px solid #FFE66D`,
              opacity,
              pointerEvents: "none",
            }}
          />
        );
      })}
      {/* Center flash */}
      {progress < 0.3 && (
        <div
          style={{
            position: "absolute",
            left: x - 8,
            top: y - 8,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "#FFE66D",
            opacity: 1 - progress / 0.3,
            boxShadow: "0 0 20px #FFE66D",
          }}
        />
      )}
    </>
  );
};

export const FastRippleContainer: React.FC<{
  ripples: Array<{ frame: number; x: number; y: number }>;
}> = ({ ripples }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {ripples.map((ripple, index) => (
        <FastRipple
          key={index}
          x={ripple.x}
          y={ripple.y}
          triggerFrame={ripple.frame}
        />
      ))}
    </div>
  );
};

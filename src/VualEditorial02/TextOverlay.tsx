import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { ShuffleText } from "./ShuffleText";

const FPS = 24;

export const TextOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  const textStartFrame = FPS * 1;
  const textOpacity = interpolate(
    frame,
    [textStartFrame, textStartFrame + 6, FPS * 5.5, FPS * 7],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scanlineOpacity = interpolate(
    frame,
    [textStartFrame, textStartFrame + 12, FPS * 6, FPS * 7],
    [0, 0.06, 0.06, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Scanline */}
      <AbsoluteFill
        style={{
          opacity: scanlineOpacity,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 212, 255, 0.03) 2px,
            rgba(0, 212, 255, 0.03) 4px
          )`,
          pointerEvents: "none",
        }}
      />

      {/* Text */}
      <AbsoluteFill
        style={{
          opacity: textOpacity,
          justifyContent: "flex-start",
          alignItems: "flex-end",
          padding: "80px 60px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "35%",
            background: "linear-gradient(135deg, transparent 30%, rgba(0,0,0,0.4) 100%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <ShuffleText
            lines={[
              "6th March 2026",
              "@Shibuya, Tokyo, Japan",
            ]}
            startFrame={textStartFrame + 6}
            shuffleDuration={12}
            glowColor="#00d4ff"
            fontSize={30}
            fontWeight={400}
            letterSpacing={4}
            lineHeight={1.8}
            textAlign="right"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

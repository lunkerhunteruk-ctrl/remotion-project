import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { ShuffleTextV2 } from "./ShuffleTextV2";

const FPS = 24;

export const TextOverlayV2Square: React.FC = () => {
  const frame = useCurrentFrame();

  const textStartFrame = FPS * 1;
  const textOpacity = interpolate(
    frame,
    [textStartFrame, textStartFrame + 4, FPS * 7, FPS * 7.5],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <AbsoluteFill
        style={{
          opacity: textOpacity,
          justifyContent: "flex-start",
          alignItems: "flex-end",
          padding: "50px 40px",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <ShuffleTextV2
            lines={[
              "6TH MARCH 2026",
              "@SHIBUYA, TOKYO",
            ]}
            startFrame={textStartFrame + 4}
            shuffleDuration={14}
            glowColor="#00ffff"
            glowColor2="#ff00ff"
            fontSize={38}
            letterSpacing={5}
            lineHeight={1.6}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

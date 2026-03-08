import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { SlideText } from "./SlideText";

const FPS = 24;
const TOTAL_DURATION = 912; // 38s * 24fps

export const VUAL_EDITORIAL_03_DURATION = TOTAL_DURATION;

export const TextOverlay03: React.FC = () => {
  const frame = useCurrentFrame();

  const textStartFrame = FPS * 1;
  const textOpacity = interpolate(
    frame,
    [textStartFrame, textStartFrame + 4, FPS * 8, FPS * 8.5],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <AbsoluteFill
        style={{
          opacity: textOpacity,
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
        <SlideText
          lines={[
            { text: "6TH MARCH 2026", from: "left" },
            { text: "THE ACROPOLIS", from: "right" },
            { text: "ATHENS", from: "right" },
          ]}
          startFrame={textStartFrame + 4}
          fontSize={54}
          lineSpacing={68}
          baseY={55}
          fadeOutStart={FPS * 7}
          fadeOutDuration={12}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

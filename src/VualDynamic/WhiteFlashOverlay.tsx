import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * White flash at each cut point between shots.
 * 3 frames before and 3 frames after with gradual opacity.
 */
export const WhiteFlashOverlay: React.FC<{ cutFrames: number[] }> = ({
  cutFrames,
}) => {
  const frame = useCurrentFrame();

  let opacity = 0;
  for (const cut of cutFrames) {
    const dist = frame - cut;
    if (dist >= -3 && dist <= 3) {
      if (dist >= -1 && dist <= 0) {
        opacity = 1;
      } else if (dist === -2 || dist === 1) {
        opacity = Math.max(opacity, 0.67);
      } else if (dist === -3 || dist === 2) {
        opacity = Math.max(opacity, 0.33);
      }
    }
  }

  if (opacity === 0) return null;

  return (
    <AbsoluteFill
      style={{ backgroundColor: `rgba(255, 255, 255, ${opacity})` }}
    />
  );
};

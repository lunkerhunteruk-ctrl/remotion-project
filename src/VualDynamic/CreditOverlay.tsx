import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import type { VualDynamicProps } from "./schema";

const FPS = 24;
const CREDIT_DURATION_SEC = 5;
const CREDIT_DURATION_FRAMES = CREDIT_DURATION_SEC * FPS; // 120 frames

/**
 * CreditOverlay: Displays item credits (category, name, brand, price)
 * on the last clip. Appears 5 seconds before the shot ends (= ending start)
 * and fades out at the shot end.
 *
 * Positioned bottom-right. All pixel values scaled by width/1920.
 */
export const CreditOverlay: React.FC<{
  credits: NonNullable<VualDynamicProps["credits"]>;
  durationFrames: number;
}> = ({ credits, durationFrames }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const s = width / 1920;

  if (!credits || credits.length === 0) return null;

  const fadeInStart = durationFrames - CREDIT_DURATION_FRAMES;
  const fadeOutStart = durationFrames - FPS * 0.8; // start fading 0.8s before end

  const elapsed = frame - fadeInStart;
  if (elapsed < 0) return null;

  // Fade in over 0.6s
  const enterOpacity = interpolate(elapsed, [0, FPS * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Fade out over 0.8s at end of shot
  const exitElapsed = frame - fadeOutStart;
  const exitOpacity =
    exitElapsed > 0
      ? interpolate(exitElapsed, [0, FPS * 0.8], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const opacity = Math.min(enterOpacity, exitOpacity);
  if (opacity <= 0) return null;

  // Subtle slide up on enter
  const translateY = interpolate(elapsed, [0, FPS * 0.6], [20 * s, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60 * s,
        right: 60 * s,
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: "right",
        maxWidth: `${600 * s}px`,
      }}
    >
      {credits.map((item, i) => (
        <div
          key={i}
          style={{
            marginBottom: i < credits.length - 1 ? 12 * s : 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 20 * s,
              fontWeight: 500,
              color: "#ffffff",
              lineHeight: 1.4,
              textShadow: `0 ${1 * s}px ${4 * s}px rgba(0,0,0,0.7)`,
            }}
          >
            {item.category}: {item.name} ({item.brand})
          </div>
          <div
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 16 * s,
              fontWeight: 400,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.4,
              textShadow: `0 ${1 * s}px ${4 * s}px rgba(0,0,0,0.7)`,
            }}
          >
            {item.price}
          </div>
        </div>
      ))}
    </div>
  );
};

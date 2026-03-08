import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { FONT_MAP } from "./fonts";

/**
 * Ending card with brand name and tagline.
 * 3 seconds, fades in from white flash.
 */
export const EndingCard: React.FC<{
  brandName?: string;
  tagline?: string;
  textFont: string;
}> = ({ brandName, tagline, textFont }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const fontFamily = FONT_MAP[textFont] || FONT_MAP.impact;
  const s = width / 1920;

  // White flash fades out over first 12 frames
  const whiteFlash = interpolate(frame, [0, 12], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Brand name fades in
  const brandOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const brandScale = interpolate(frame, [8, 24], [1.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const brandTracking = interpolate(frame, [8, 28], [30, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Tagline fades in later
  const taglineOpacity = interpolate(frame, [24, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative line
  const lineWidth = interpolate(frame, [16, 32], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {brandName && (
          <div
            style={{
              fontFamily,
              fontSize: 72 * s,
              fontWeight: 900,
              fontStyle: "italic",
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: brandTracking * s,
              opacity: brandOpacity,
              transform: `scale(${brandScale})`,
              textShadow: "0 0 40px rgba(255,255,255,0.15)",
            }}
          >
            {brandName}
          </div>
        )}

        {/* Decorative line */}
        <div
          style={{
            width: lineWidth * s,
            height: 2,
            backgroundColor: "rgba(255,255,255,0.4)",
          }}
        />

        {tagline && (
          <div
            style={{
              fontFamily:
                "'Noto Sans JP', 'Noto Sans', sans-serif",
              fontSize: 24 * s,
              fontWeight: 300,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: 6 * s,
              opacity: taglineOpacity,
            }}
          >
            {tagline}
          </div>
        )}
      </AbsoluteFill>

      {/* White flash transition from previous shot */}
      <AbsoluteFill
        style={{ backgroundColor: "#ffffff", opacity: whiteFlash }}
      />
    </AbsoluteFill>
  );
};

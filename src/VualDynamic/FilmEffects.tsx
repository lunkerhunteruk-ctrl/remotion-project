import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { FilmEffects, EffectLevel } from "./schema";

// ── Strength maps ───────────────────────────────────────

const VIGNETTE_STRENGTH: Record<EffectLevel, number> = {
  off: 0,
  weak: 0.25,
  medium: 0.4,
  strong: 0.6,
};

const COLOR_CHROME_FILTER: Record<EffectLevel, string> = {
  off: "none",
  weak: "saturate(1.08) contrast(1.04) sepia(0.02)",
  medium: "saturate(1.15) contrast(1.08) sepia(0.04)",
  strong: "saturate(1.25) contrast(1.12) sepia(0.06)",
};

const CHROME_BLUE_OPACITY: Record<EffectLevel, number> = {
  off: 0,
  weak: 0.06,
  medium: 0.12,
  strong: 0.2,
};

const GRAIN_OPACITY: Record<EffectLevel, number> = {
  off: 0,
  weak: 0.03,
  medium: 0.06,
  strong: 0.1,
};

const COLOR_SHIFT_OPACITY: Record<EffectLevel, number> = {
  off: 0,
  weak: 0.04,
  medium: 0.08,
  strong: 0.14,
};

/**
 * Returns the CSS filter string for Color Chrome effect level.
 * Applied to the <AbsoluteFill> wrapping each shot's <OffthreadVideo>.
 */
export function getColorChromeFilter(level: EffectLevel): string {
  return COLOR_CHROME_FILTER[level];
}

/**
 * Renders all film effect overlays (vignette, chrome blue, grain, color shift).
 * Color Chrome is handled separately via CSS filter on the video wrapper.
 */
export const FilmEffectsOverlay: React.FC<{ effects: FilmEffects }> = ({
  effects,
}) => {
  const frame = useCurrentFrame();

  const vignetteStrength = VIGNETTE_STRENGTH[effects.vignette] ?? 0;
  const chromeBlueOpacity = CHROME_BLUE_OPACITY[effects.colorChromeBlue] ?? 0;
  const grainOpacity = GRAIN_OPACITY[effects.grain] ?? 0;
  const colorShiftOpacity = COLOR_SHIFT_OPACITY[effects.colorShift] ?? 0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Vignette — radial gradient darkening at edges */}
      {vignetteStrength > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vignetteStrength}) 100%)`,
          }}
        />
      )}

      {/* Color Chrome Blue — blue-tinted soft-light overlay */}
      {chromeBlueOpacity > 0 && (
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(40,80,140,0) 0%, rgba(40,80,140,1) 100%)",
            opacity: chromeBlueOpacity,
            mixBlendMode: "soft-light",
          }}
        />
      )}

      {/* Grain — animated SVG noise */}
      {grainOpacity > 0 && (
        <AbsoluteFill style={{ opacity: grainOpacity }}>
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
          >
            <filter id={`grain-${frame % 3}`}>
              <feTurbulence
                type="fractal"
                baseFrequency="0.65"
                numOctaves={3}
                seed={frame}
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect
              width="100%"
              height="100%"
              filter={`url(#grain-${frame % 3})`}
            />
          </svg>
        </AbsoluteFill>
      )}

      {/* Color Shift — shadow tint (cool) + highlight tint (warm) */}
      {colorShiftOpacity > 0 && (
        <>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, transparent 30%, rgba(30,80,70,1) 100%)",
              opacity: colorShiftOpacity,
              mixBlendMode: "lighten",
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, rgba(255,220,180,1) 0%, transparent 60%)",
              opacity: colorShiftOpacity * 0.7,
              mixBlendMode: "multiply",
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};

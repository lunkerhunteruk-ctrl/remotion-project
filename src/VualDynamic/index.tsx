import React from "react";
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Audio,
  useCurrentFrame,
  interpolate,
} from "remotion";
import type { VualDynamicProps } from "./schema";
import { WhiteFlashOverlay } from "./WhiteFlashOverlay";
import { DynamicTextOverlay } from "./DynamicTextOverlay";
import { MetadataOverlay } from "./MetadataOverlay";
import { EndingCard } from "./EndingCard";
import { DynamicIntro, INTRO_DURATION_FRAMES } from "./DynamicIntro";
import { FilmEffectsOverlay, getColorChromeFilter } from "./FilmEffects";
import { CreditOverlay } from "./CreditOverlay";
import { FilmFrameOverlay, FILM_FRAME } from "./FilmFrameOverlay";

const FPS = 24;
const ENDING_DURATION_SEC = 3;
const FADE_OUT_FRAMES = Math.round(FPS * 0.8); // ~0.8 second fade to black

const DEFAULT_EFFECTS = {
  vignette: "off" as const,
  colorChrome: "off" as const,
  colorChromeBlue: "off" as const,
  grain: "off" as const,
  colorShift: "off" as const,
};

/**
 * Calculate total duration in frames from props.
 */
export function calculateDuration(props: VualDynamicProps): number {
  const introFrames = props.showIntro ? INTRO_DURATION_FRAMES : 0;
  const shotFrames = props.shots.reduce(
    (sum, shot) => sum + shot.durationSec * FPS,
    0
  );
  const endingFrames = props.showEnding ? ENDING_DURATION_SEC * FPS : 0;
  return introFrames + shotFrames + endingFrames;
}

/**
 * VualDynamic: Fully data-driven editorial video composition.
 *
 * Receives all shot data, text overlays, BGM, and style settings via props.
 * Designed to be rendered via Remotion Lambda with serialized inputProps.
 */
export const VualDynamic: React.FC<VualDynamicProps> = (props) => {
  const {
    shots,
    textStyle,
    textFont,
    bgmUrl,
    showIntro,
    introStyle,
    introText,
    locationText,
    dateText,
    showEnding,
    whiteFlash,
    brandName,
    tagline,
    aspectRatio,
    filmEffects,
    flatLayImageUrls,
    credits,
    filmFrame,
  } = props;

  // Letterbox mode: 4:5 canvas with source video fitted inside (no crop)
  const isLetterbox = aspectRatio === "4:5";

  // Film Print frame mode: content is positioned inside the frame border
  const isFilmFrame = filmFrame && (aspectRatio || "16:9") === "16:9";

  // Film effects
  const effects = filmEffects || DEFAULT_EFFECTS;
  const cssFilter = getColorChromeFilter(effects.colorChrome);

  // Calculate frame layout
  const introFrames = showIntro ? INTRO_DURATION_FRAMES : 0;
  const shotStartFrames: number[] = [];
  const cutFrames: number[] = [];
  let currentFrame = introFrames;

  for (let i = 0; i < shots.length; i++) {
    shotStartFrames.push(currentFrame);
    currentFrame += shots[i].durationSec * FPS;
    if (i < shots.length - 1) {
      cutFrames.push(currentFrame);
    }
  }

  const totalShotFrames = currentFrame;
  const endingFrames = showEnding ? ENDING_DURATION_SEC * FPS : 0;

  // Content container style: positions video content inside film frame border
  const contentStyle: React.CSSProperties = isFilmFrame
    ? {
        position: "absolute",
        left: FILM_FRAME.videoLeft,
        top: FILM_FRAME.videoTop,
        width: FILM_FRAME.videoWidth,
        height: FILM_FRAME.videoHeight,
        overflow: "hidden",
      }
    : { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" };

  return (
    <AbsoluteFill style={{ backgroundColor: isFilmFrame ? "#f5f0e8" : "#000" }}>
      {/* Video content area */}
      <div style={contentStyle}>
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          {/* Intro */}
          {showIntro && (
            <Sequence from={0} durationInFrames={introFrames}>
              <DynamicIntro
                introStyle={introStyle || "flatlay"}
                introText={introText}
                textFont={textFont}
                flatLayImageUrls={flatLayImageUrls}
              />
            </Sequence>
          )}

          {/* Video shots */}
          {shots.map((shot, i) => {
            const dur = shot.durationSec * FPS;
            return (
              <Sequence
                key={`shot-${i}`}
                from={shotStartFrames[i]}
                durationInFrames={dur}
              >
                <AbsoluteFill style={{ filter: cssFilter }}>
                  <OffthreadVideo
                    src={shot.clipUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: isLetterbox ? "contain" : "cover",
                    }}
                  />
                </AbsoluteFill>

                {/* Text overlay per shot */}
                <DynamicTextOverlay
                  shot={shot}
                  shotIndex={i}
                  localStartFrame={0}
                  durationFrames={dur}
                  textStyle={textStyle}
                  textFont={textFont}
                />

                {/* Date & Location on first shot */}
                {i === 0 && (dateText || locationText) && (
                  <MetadataOverlay
                    dateText={dateText}
                    locationText={locationText}
                    durationFrames={dur}
                    textStyle={textStyle}
                    textFont={textFont}
                  />
                )}

                {/* Credit overlay on last shot */}
                {i === shots.length - 1 && credits && credits.length > 0 && (
                  <CreditOverlay credits={credits} durationFrames={dur} />
                )}
              </Sequence>
            );
          })}

          {/* Film effects overlay — shots only */}
          {shots.length > 0 && (
            <Sequence from={introFrames} durationInFrames={totalShotFrames - introFrames}>
              <FilmEffectsOverlay effects={effects} />
            </Sequence>
          )}

          {/* White flash at cut points */}
          {whiteFlash && <WhiteFlashOverlay cutFrames={cutFrames} />}

          {/* Ending card */}
          {showEnding && (
            <Sequence from={totalShotFrames} durationInFrames={endingFrames}>
              <EndingCard
                brandName={brandName}
                tagline={tagline}
                textFont={textFont}
              />
            </Sequence>
          )}

          {/* Fade to black at the end */}
          <FadeToBlack totalFrames={totalShotFrames + endingFrames} />
        </AbsoluteFill>
      </div>

      {/* Film Print frame overlay (top layer) */}
      {isFilmFrame && <FilmFrameOverlay />}

      {/* BGM */}
      {bgmUrl && (
        <Audio
          src={bgmUrl}
          volume={0.4}
        />
      )}
    </AbsoluteFill>
  );
};

const FadeToBlack: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const fadeStart = totalFrames - FADE_OUT_FRAMES;
  const opacity = interpolate(
    frame,
    [fadeStart, totalFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill
      style={{ backgroundColor: "#000", opacity }}
    />
  );
};

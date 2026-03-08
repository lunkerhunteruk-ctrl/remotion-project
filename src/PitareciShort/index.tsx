import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
  OffthreadVideo,
} from "remotion";
import { z } from "zod";
import { CaptionFast, FastRippleContainer } from "./CaptionFast";
import { SceneConfig } from "./types";

// プリセットをインポート（ここを変えるだけで切り替え可能）
import { scenes, totalDuration } from "./presets/preset-01";

// Schema for props
export const pitareciShortSchema = z.object({
  primaryColor: z.string().default("#FF6B35"),
  backgroundColor: z.string().default("#1a1a1a"),
  textColor: z.string().default("#FFFFFF"),
  accentColor: z.string().default("#FFE66D"),
});

type PitareciShortProps = z.infer<typeof pitareciShortSchema>;

// Flash transition component
const FlashTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 3, 6], [0, 0.8, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Scene visual component (audio handled separately at composition level)
const SceneVisual: React.FC<{
  scene: SceneConfig;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();

  // No fade-in - instant cut between scenes
  const fadeIn = 1;

  // Determine which video to show (for combined scenes)
  const showVideo2 = scene.video2 && scene.video2StartFrame && frame >= scene.video2StartFrame;
  const currentVideo = showVideo2 ? scene.video2! : scene.video;

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      {/* Video layer - primary */}
      {!showVideo2 && (
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile(scene.video)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            playbackRate={scene.playbackRate || 1}
            muted
          />
        </AbsoluteFill>
      )}

      {/* Video layer - secondary (when switching) */}
      {showVideo2 && scene.video2 && (
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile(scene.video2)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            playbackRate={scene.playbackRate || 1}
            muted
          />
        </AbsoluteFill>
      )}

      {/* Video switching handled by showVideo2 logic - no flash */}

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Fast ripple effects */}
      {scene.ripples && (
        <FastRippleContainer ripples={scene.ripples} />
      )}

      {/* Caption - pop in */}
      <Sequence from={3 + (scene.captionDelay || 0)} durationInFrames={scene.durationFrames - 3 - (scene.captionDelay || 0)}>
        <CaptionFast
          text={scene.caption}
          style={scene.isEndCard ? "endcard" : "impact"}
          clickFrame={scene.clickFrame ? scene.clickFrame - 3 - (scene.captionDelay || 0) : undefined}
          position={scene.captionPosition || "bottom"}
        />
      </Sequence>

      {/* No flash - clean cuts */}
    </AbsoluteFill>
  );
};

// Calculate scene start frames
const sceneStartFrames: number[] = [];
let tempFrame = 0;
for (const scene of scenes) {
  sceneStartFrames.push(tempFrame);
  tempFrame += scene.durationFrames;
}

// Main composition
export const PitareciShort: React.FC<PitareciShortProps> = ({
  primaryColor,
  backgroundColor,
  textColor,
  accentColor,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* BGM - energetic, louder */}
      <Audio
        src={staticFile("/audio/bgm.mp3")}
        volume={0.2}
        loop
      />

      {/* Narration audio - each plays exactly until next scene starts */}
      {scenes.map((scene, index) => {
        // Skip scenes without narration
        if (!scene.narrationFile) return null;

        const narrationStart = sceneStartFrames[index] + (scene.narrationDelay || 0);
        const nextSceneStart = index < scenes.length - 1
          ? sceneStartFrames[index + 1]
          : totalDuration;
        const audioDuration = nextSceneStart - narrationStart;

        return (
          <Sequence
            key={`narration-${scene.id}`}
            from={narrationStart}
            durationInFrames={audioDuration}
          >
            <Audio
              src={staticFile(scene.narrationFile)}
              volume={1}
            />
          </Sequence>
        );
      })}

      {/* Tap sounds for scene 3 ripples */}
      {scenes[2].ripples?.map((ripple, index) => (
        <Sequence
          key={`tap-${index}`}
          from={sceneStartFrames[2] + ripple.frame}
          durationInFrames={15}
        >
          <Audio
            src={staticFile("/audio/tap_sound.mp3")}
            volume={0.5}
          />
        </Sequence>
      ))}

      {/* Search click sound for scene 6 */}
      {scenes[5].clickFrame && (
        <Sequence
          key="search-click"
          from={sceneStartFrames[5] + scenes[5].clickFrame}
          durationInFrames={15}
        >
          <Audio
            src={staticFile("/audio/tap_sound.mp3")}
            volume={0.6}
          />
        </Sequence>
      )}

      {/* Simmering sound for scene 1 */}
      <Sequence
        key="gutsugutsu-1"
        from={sceneStartFrames[0]}
        durationInFrames={scenes[0].durationFrames}
      >
        <Audio
          src={staticFile("/audio/gutsugutsu.mp3")}
          volume={0.3}
        />
      </Sequence>

      {/* Simmering sound for scene 5 */}
      <Sequence
        key="gutsugutsu-5"
        from={sceneStartFrames[4]}
        durationInFrames={scenes[4].durationFrames}
      >
        <Audio
          src={staticFile("/audio/gutsugutsu.mp3")}
          volume={0.3}
        />
      </Sequence>

      {/* Render all scenes (visuals only) */}
      {scenes.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={sceneStartFrames[index]}
          durationInFrames={scene.durationFrames}
        >
          <SceneVisual scene={scene} accentColor={accentColor} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Export total duration for Root.tsx (15 seconds = 450 frames)
export const PITARECI_SHORT_DURATION = totalDuration;

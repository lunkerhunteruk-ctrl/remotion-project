import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Video,
  staticFile,
} from "remotion";
import editorialData from "./data.json";

interface ShotData {
  shot: number;
  title_ja: string;
  caption_ja: string;
  caption_en: string;
  video: string;
  shot_duration_sec: number;
  products: Array<{ name: string; brand: string; price: number; currency: string }>;
}

const typedShots: ShotData[] = editorialData.shots;
const FPS = 30;

// ── Calculate total duration (shots only, simple cut) ──
const shotFrames = typedShots.map((s) => s.shot_duration_sec * FPS);
const totalShotFrames = shotFrames.reduce((a, b) => a + b, 0);
export const VUAL_EDITORIAL_DURATION = totalShotFrames;

// ── Shot (simple cut, no effects) ──
const Shot: React.FC<{
  videoSrc: string;
  durationFrames: number;
}> = ({ videoSrc, durationFrames }) => {
  void durationFrames;
  return (
    <AbsoluteFill>
      <Video
        src={staticFile(videoSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

// ── Main Composition ──
export const VualEditorial: React.FC = () => {
  const shots = typedShots;

  // Calculate start frames for each shot (simple sequential)
  let currentFrame = 0;
  const shotStarts: number[] = [];
  for (let i = 0; i < shots.length; i++) {
    shotStarts.push(currentFrame);
    currentFrame += shots[i].shot_duration_sec * FPS;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {shots.map((shot, i) => {
        const dur = shot.shot_duration_sec * FPS;
        return (
          <Sequence
            key={shot.shot}
            from={shotStarts[i]}
            durationInFrames={dur}
          >
            <Shot
              videoSrc={shot.video}
              durationFrames={dur}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

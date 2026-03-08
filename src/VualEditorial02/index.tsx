import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Video,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { ShuffleText } from "./ShuffleText";

const FPS = 24;

// Shot order: 03(6s) > 08(6s) > 04(8s) > 05(6s) > 06(8s) = 34s
const SHOTS = [
  { file: "03.mp4", durationSec: 6 },
  { file: "08.mp4", durationSec: 6 },
  { file: "04.mp4", durationSec: 8 },
  { file: "05.mp4", durationSec: 6 },
  { file: "06.mp4", durationSec: 8 },
];

const TOTAL_FRAMES = SHOTS.reduce((sum, s) => sum + s.durationSec * FPS, 0);
export const VUAL_EDITORIAL_02_DURATION = TOTAL_FRAMES; // 816

// White flash overlay at cut points
const WhiteFlash: React.FC<{ cutFrames: number[] }> = ({ cutFrames }) => {
  const frame = useCurrentFrame();

  // For each cut point, flash 3 frames before and 3 frames after
  let opacity = 0;
  for (const cut of cutFrames) {
    const dist = frame - cut; // negative = before cut, positive = after
    if (dist >= -3 && dist <= 3) {
      if (dist >= -1 && dist <= 0) {
        opacity = 1; // peak white
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
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      }}
    />
  );
};

export const VualEditorial02: React.FC = () => {
  const frame = useCurrentFrame();

  // Calculate start frames and cut points
  const startFrames: number[] = [];
  const cutFrames: number[] = [];
  let currentFrame = 0;
  for (let i = 0; i < SHOTS.length; i++) {
    startFrames.push(currentFrame);
    currentFrame += SHOTS[i].durationSec * FPS;
    if (i < SHOTS.length - 1) {
      cutFrames.push(currentFrame); // cut point between shots
    }
  }

  // Text overlay timing
  const textStartFrame = FPS * 1;
  const textOpacity = interpolate(
    frame,
    [textStartFrame, textStartFrame + 6, FPS * 5.5, FPS * 7],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle scanline for electric feel
  const scanlineOpacity = interpolate(
    frame,
    [textStartFrame, textStartFrame + 12, FPS * 6, FPS * 7],
    [0, 0.06, 0.06, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Video shots as sequences */}
      {SHOTS.map((shot, i) => {
        const dur = shot.durationSec * FPS;
        return (
          <Sequence key={shot.file} from={startFrames[i]} durationInFrames={dur}>
            <AbsoluteFill>
              <Video
                src={staticFile(`videos/vual-editorial-02/norm/${shot.file}`)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* White flash at cut points */}
      <WhiteFlash cutFrames={cutFrames} />

      {/* Scanline overlay */}
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

      {/* Text overlay - right aligned, upper area */}
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

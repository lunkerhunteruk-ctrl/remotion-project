import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// Schema for props
export const pitareciSchema = z.object({
  backgroundColor: z.string().default("#1a1a2e"),
  textColor: z.string().default("#ffffff"),
  accentColor: z.string().default("#e94560"),
});

type PitareciProps = z.infer<typeof pitareciSchema>;

// Caption data type
interface CaptionData {
  id: string;
  text: string;
  startFrame: number;
  durationFrames: number;
  audioFile: string;
}

interface SoundEffectData {
  id: string;
  startFrame: number;
  durationFrames: number;
  audioFile: string;
}

// Ripple effect component
const RippleEffect: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const frame = useCurrentFrame();

  if (!trigger) return null;

  const rippleProgress = interpolate(frame % 30, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 200 + rippleProgress * 300,
        height: 200 + rippleProgress * 300,
        borderRadius: "50%",
        border: `3px solid rgba(233, 69, 96, ${1 - rippleProgress})`,
        pointerEvents: "none",
      }}
    />
  );
};

// Single caption component with animation
const Caption: React.FC<{
  text: string;
  textColor: string;
  accentColor: string;
}> = ({ text, textColor, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: {
      damping: 50,
      stiffness: 200,
    },
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 200,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 40px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "20px 40px",
          borderRadius: 16,
          borderLeft: `4px solid ${accentColor}`,
          transform: `translateY(${interpolate(slideIn, [0, 1], [50, 0])}px)`,
          opacity,
        }}
      >
        <p
          style={{
            color: textColor,
            fontSize: 48,
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 700,
            margin: 0,
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

// Main Pitareci component
export const Pitareci: React.FC<PitareciProps> = ({
  backgroundColor,
  textColor,
  accentColor,
}) => {
  const frame = useCurrentFrame();

  // Sample caption data - in production, load from manifest.json
  const captions: CaptionData[] = [
    {
      id: "caption_01",
      text: "今日は簡単レシピを紹介します",
      startFrame: 0,
      durationFrames: 90,
      audioFile: "/audio/caption_01.mp3",
    },
    {
      id: "caption_02",
      text: "まず材料を準備しましょう",
      startFrame: 100,
      durationFrames: 75,
      audioFile: "/audio/caption_02.mp3",
    },
    {
      id: "caption_03",
      text: "フライパンで炒めていきます",
      startFrame: 185,
      durationFrames: 75,
      audioFile: "/audio/caption_03.mp3",
    },
    {
      id: "caption_04",
      text: "完成です！いただきます",
      startFrame: 270,
      durationFrames: 90,
      audioFile: "/audio/caption_04.mp3",
    },
  ];

  const soundEffects: SoundEffectData[] = [
    {
      id: "tap_sound",
      startFrame: 95,
      durationFrames: 15,
      audioFile: "/audio/tap_sound.mp3",
    },
    {
      id: "sizzle_sound",
      startFrame: 185,
      durationFrames: 60,
      audioFile: "/audio/sizzle_sound.mp3",
    },
  ];

  // Check if we should show ripple effect (at tap sound timing)
  const showRipple = frame >= 95 && frame < 110;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      {/* Background gradient animation */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${50 + Math.sin(frame / 30) * 10}% ${50 + Math.cos(frame / 30) * 10}%, ${accentColor}22, transparent 70%)`,
        }}
      />

      {/* Ripple effect */}
      <RippleEffect trigger={showRipple} />

      {/* Caption sequences with audio */}
      {captions.map((caption) => (
        <Sequence
          key={caption.id}
          from={caption.startFrame}
          durationInFrames={caption.durationFrames}
        >
          <Caption
            text={caption.text}
            textColor={textColor}
            accentColor={accentColor}
          />
          <Audio src={staticFile(caption.audioFile)} volume={1} />
        </Sequence>
      ))}

      {/* Sound effect sequences */}
      {soundEffects.map((effect) => (
        <Sequence
          key={effect.id}
          from={effect.startFrame}
          durationInFrames={effect.durationFrames}
        >
          <Audio src={staticFile(effect.audioFile)} volume={0.5} />
        </Sequence>
      ))}

      {/* Title overlay */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: accentColor,
            fontSize: 36,
            fontWeight: 300,
            letterSpacing: 8,
            margin: 0,
          }}
        >
          PITARECI
        </h1>
      </div>
    </AbsoluteFill>
  );
};

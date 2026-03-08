// Scene configuration type for PitareciShort presets

export interface SceneConfig {
  id: string;
  video: string;
  video2?: string; // Optional second video for combined scenes
  video2StartFrame?: number; // When to switch to second video
  durationFrames: number;
  playbackRate?: number;
  caption: string;
  narrationFile: string;
  ripples?: Array<{ frame: number; x: number; y: number }>;
  isEndCard?: boolean;
  isHook?: boolean; // Hook scene - quick flash
  clickFrame?: number; // Frame for search click effect
  captionDelay?: number; // Delay caption start
  narrationDelay?: number; // Delay narration start
  captionPosition?: "top" | "bottom"; // Caption position
}

export interface Preset {
  name: string;
  description: string;
  scenes: SceneConfig[];
  totalDuration: number;
}

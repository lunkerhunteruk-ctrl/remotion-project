import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";

// Configuration
const API_KEY = process.env.ELEVENLABS_API_KEY || "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "fUjY9K2nAIwlALOwSiwc";

const client = new ElevenLabsClient({
  apiKey: API_KEY,
});

// Output directories
const AUDIO_DIR = path.join(__dirname, "../public/audio");
const SHORT_AUDIO_DIR = path.join(AUDIO_DIR, "short");

// Load script data
interface SceneData {
  id: string;
  video: string;
  durationFrames: number;
  displayText: string;
  speechText: string;
  playbackRate?: number;
  ripples?: Array<{ frame: number; x: number; y: number }>;
  soundEffect?: { file: string; volume: number };
  endCard?: { tagline: string; appName: string; cta: string; startFrame: number };
}

interface ScriptData {
  title: string;
  fps: number;
  width: number;
  height: number;
  scenes: SceneData[];
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
}

// Sound effects to generate
const soundEffects = [
  {
    id: "tap_sound",
    prompt: "A gentle, elegant wooden tap sound, soft click, subtle and refined, single tap",
    durationSeconds: 0.5,
  },
  {
    id: "sizzle_sound",
    prompt: "Sizzling sound of food frying in a hot pan, oil crackling, cooking ambiance, warm kitchen",
    durationSeconds: 5,
  },
];

async function ensureDirectories() {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
  if (!fs.existsSync(SHORT_AUDIO_DIR)) {
    fs.mkdirSync(SHORT_AUDIO_DIR, { recursive: true });
  }
}

async function generateNarration(id: string, speechText: string, displayText: string): Promise<string> {
  const outputPath = path.join(SHORT_AUDIO_DIR, `${id}.mp3`);

  // Always regenerate to ensure correct pronunciation
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
    console.log(`[Delete] Removing old ${id} for regeneration`);
  }

  console.log(`[Narration] Display: "${displayText.substring(0, 25)}..."`);
  console.log(`[Narration] Speech:  "${speechText}"`);

  try {
    const audioStream = await client.textToSpeech.convert(VOICE_ID, {
      text: speechText,
      modelId: "eleven_turbo_v2_5",  // Better Japanese intonation
      outputFormat: "mp3_44100_128",
      voiceSettings: {
        stability: 0.35,       // Balanced expressiveness
        similarityBoost: 0.8,  // Voice consistency
        style: 0.6,            // Natural variation
      },
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }

    fs.writeFileSync(outputPath, Buffer.concat(chunks));
    console.log(`[Success] ${id} saved\n`);
    return outputPath;
  } catch (error) {
    console.error(`[Error] ${id}:`, error);
    throw error;
  }
}

async function generateSoundEffect(
  id: string,
  prompt: string,
  durationSeconds: number
): Promise<string> {
  const outputPath = path.join(AUDIO_DIR, `${id}.mp3`);

  if (fs.existsSync(outputPath)) {
    console.log(`[Skip] SFX ${id} already exists`);
    return outputPath;
  }

  console.log(`[SFX] Generating: "${prompt.substring(0, 40)}..."`);

  try {
    const audioStream = await client.textToSoundEffects.convert({
      text: prompt,
      durationSeconds: durationSeconds,
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }

    fs.writeFileSync(outputPath, Buffer.concat(chunks));
    console.log(`[Success] SFX ${id} saved`);
    return outputPath;
  } catch (error) {
    console.error(`[Error] SFX ${id}:`, error);
    throw error;
  }
}

async function downloadBGM(): Promise<void> {
  const bgmPath = path.join(AUDIO_DIR, "bgm.mp3");

  if (fs.existsSync(bgmPath)) {
    console.log("[Skip] BGM already exists");
    return;
  }

  console.log("[BGM] Attempting to download royalty-free acoustic BGM...");

  const bgmSources = [
    "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3",
    "https://cdn.pixabay.com/download/audio/2021/11/01/audio_69ed2a0f6e.mp3",
  ];

  for (const url of bgmSources) {
    try {
      console.log(`[BGM] Trying: ${url.substring(0, 50)}...`);

      const response = await fetch(url);
      if (!response.ok) {
        console.log(`[BGM] HTTP ${response.status}, trying next source...`);
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      fs.writeFileSync(bgmPath, Buffer.from(arrayBuffer));
      console.log("[Success] BGM downloaded");
      return;
    } catch (error) {
      console.log(`[BGM] Failed, trying next source...`);
    }
  }

  console.log("[Warning] Could not download BGM. Please add bgm.mp3 manually to public/audio/");
}

async function main() {
  console.log("\n========================================");
  console.log("  PitareciShort Audio Generator");
  console.log("  (Using speechText for pronunciation)");
  console.log("========================================\n");

  await ensureDirectories();

  // Load script data
  const scriptPath = path.join(__dirname, "../src/PitareciShort/script.json");
  const script: ScriptData = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));

  // Generate narrations using speechText
  console.log("--- Generating Narrations (with correct pronunciation) ---\n");
  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    const narrationId = `narration_0${i + 1}`;
    try {
      await generateNarration(narrationId, scene.speechText, scene.displayText);
    } catch (error) {
      console.error(`Failed: ${narrationId}`);
    }
  }

  // Generate sound effects
  console.log("\n--- Generating Sound Effects ---\n");
  for (const sfx of soundEffects) {
    try {
      await generateSoundEffect(sfx.id, sfx.prompt, sfx.durationSeconds);
    } catch (error) {
      console.error(`Failed: ${sfx.id}`);
    }
  }

  // Download BGM
  console.log("\n--- Setting up BGM ---\n");
  await downloadBGM();

  // Summary
  console.log("\n========================================");
  console.log("  Generation Complete!");
  console.log("========================================");
  console.log("\nKey improvement:");
  console.log("  - Using speechText (ひらがな) for accurate pronunciation");
  console.log("  - displayText (漢字) shown on screen");
  console.log("\nRun 'npm run dev' to preview the video.\n");
}

main().catch(console.error);

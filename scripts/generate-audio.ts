import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
const API_KEY = process.env.ELEVENLABS_API_KEY || "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "fUjY9K2nAIwlALOwSiwc";

const client = new ElevenLabsClient({
  apiKey: API_KEY,
});

interface Caption {
  id: string;
  text: string;
  startFrame: number;
  durationFrames: number;
}

interface SoundEffect {
  id: string;
  prompt: string;
  startFrame: number;
  durationFrames: number;
}

interface Script {
  title: string;
  fps: number;
  width: number;
  height: number;
  captions: Caption[];
  soundEffects: SoundEffect[];
}

const OUTPUT_DIR = path.join(__dirname, "../public/audio");

async function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function generateSpeech(caption: Caption): Promise<string> {
  const outputPath = path.join(OUTPUT_DIR, `${caption.id}.mp3`);

  // Skip if file already exists
  if (fs.existsSync(outputPath)) {
    console.log(`[Skip] ${caption.id} already exists`);
    return outputPath;
  }

  console.log(`[Generating Speech] ${caption.id}: "${caption.text}"`);

  try {
    const audioStream = await client.textToSpeech.convert(VOICE_ID, {
      text: caption.text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });

    // Collect chunks from the stream
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    fs.writeFileSync(outputPath, audioBuffer);
    console.log(`[Success] Saved to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`[Error] Failed to generate ${caption.id}:`, error);
    throw error;
  }
}

async function generateSoundEffect(effect: SoundEffect): Promise<string> {
  const outputPath = path.join(OUTPUT_DIR, `${effect.id}.mp3`);

  // Skip if file already exists
  if (fs.existsSync(outputPath)) {
    console.log(`[Skip] ${effect.id} already exists`);
    return outputPath;
  }

  console.log(`[Generating SFX] ${effect.id}: "${effect.prompt}"`);

  try {
    // Use Text to Sound Effects API
    const audioStream = await client.textToSoundEffects.convert({
      text: effect.prompt,
      duration_seconds: effect.durationFrames / 30, // Convert frames to seconds (assuming 30fps)
    });

    // Collect chunks from the stream
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    fs.writeFileSync(outputPath, audioBuffer);
    console.log(`[Success] Saved SFX to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`[Error] Failed to generate SFX ${effect.id}:`, error);
    console.log(`[Note] Text to Sound Effects API may require a specific subscription`);
    throw error;
  }
}

async function main() {
  await ensureOutputDir();

  // Load script
  const scriptPath = path.join(__dirname, "../src/Pitareci/script.json");
  const script: Script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));

  console.log(`\n=== Generating Audio for "${script.title}" ===\n`);

  // Generate speech for all captions
  console.log("--- Generating Speech ---");
  for (const caption of script.captions) {
    try {
      await generateSpeech(caption);
    } catch (error) {
      console.error(`Failed to generate speech for ${caption.id}`);
    }
  }

  // Generate sound effects
  console.log("\n--- Generating Sound Effects ---");
  for (const effect of script.soundEffects) {
    try {
      await generateSoundEffect(effect);
    } catch (error) {
      console.error(`Failed to generate SFX for ${effect.id}`);
    }
  }

  // Generate manifest file for Remotion
  const manifest = {
    generated: new Date().toISOString(),
    captions: script.captions.map((c) => ({
      ...c,
      audioFile: `/audio/${c.id}.mp3`,
    })),
    soundEffects: script.soundEffects.map((e) => ({
      ...e,
      audioFile: `/audio/${e.id}.mp3`,
    })),
  };

  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n[Manifest] Saved to ${manifestPath}`);

  console.log("\n=== Audio Generation Complete ===\n");
}

main().catch(console.error);

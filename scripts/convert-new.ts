import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegStatic as string);

const API_KEY = "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";
const VOICE_ID = "fUjY9K2nAIwlALOwSiwc"; // Yui
const client = new ElevenLabsClient({ apiKey: API_KEY });

const RECORDINGS_DIR = path.join(__dirname, "../recordings");
const OUTPUT_DIR = path.join(__dirname, "../public/audio/short");
const TEMP_DIR = path.join(__dirname, "../temp");

async function trimSilence(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters([
        'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-45dB',
        'areverse',
        'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-45dB',
        'areverse'
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

async function main() {
  console.log("Converting rec_new.m4a → narration_04.mp3");
  
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  const inputPath = path.join(RECORDINGS_DIR, "rec_new.m4a");
  const trimmedInput = path.join(TEMP_DIR, "trimmed_input.m4a");
  const tempOutput = path.join(TEMP_DIR, "temp_output.mp3");
  const finalOutput = path.join(OUTPUT_DIR, "narration_04.mp3");

  // Step 1: Trim input silence
  console.log("[1] Trimming input silence...");
  await trimSilence(inputPath, trimmedInput);

  // Step 2: Convert with ElevenLabs
  console.log("[2] Converting to Yui voice...");
  const audioData = fs.readFileSync(trimmedInput);
  const result = await client.speechToSpeech.convert(VOICE_ID, {
    audio: new Blob([audioData], { type: "audio/mp4" }),
    modelId: "eleven_multilingual_sts_v2",
    outputFormat: "mp3_44100_128",
  });

  const chunks: Buffer[] = [];
  for await (const chunk of result) {
    chunks.push(Buffer.from(chunk));
  }
  fs.writeFileSync(tempOutput, Buffer.concat(chunks));

  // Step 3: Trim output silence
  console.log("[3] Trimming output silence...");
  await trimSilence(tempOutput, finalOutput);

  // Cleanup
  fs.unlinkSync(trimmedInput);
  fs.unlinkSync(tempOutput);

  console.log("\nDone! narration_04.mp3 created");
}

main().catch(console.error);

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
        'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-55dB',
        'areverse',
        'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-55dB',
        'areverse'
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

async function convertWithTrimming(inputPath: string, outputPath: string, desc: string) {
  console.log("[" + desc + "]");
  
  const trimmedInput = path.join(TEMP_DIR, "trim_in_" + path.basename(inputPath));
  const tempOutput = path.join(TEMP_DIR, "trim_out_" + path.basename(outputPath));

  // Step 1: Trim input
  console.log("  1. Trimming input...");
  await trimSilence(inputPath, trimmedInput);

  // Step 2: Convert with ElevenLabs
  console.log("  2. Converting to Yui...");
  const audioData = fs.readFileSync(trimmedInput);
  const result = await client.speechToSpeech.convert(VOICE_ID, {
    audio: new Blob([audioData], { type: "audio/mp4" }),
    modelId: "eleven_multilingual_sts_v2",
    outputFormat: "mp3_44100_128",
  });

  // Handle the stream result
  const chunks: Buffer[] = [];
  const reader = (result as any).getReader ? (result as any).getReader() : null;

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
  } else if (Symbol.asyncIterator in (result as any)) {
    for await (const chunk of result as any) {
      chunks.push(Buffer.from(chunk));
    }
  } else {
    // Assume it's already a buffer or array
    chunks.push(Buffer.from(result as any));
  }
  fs.writeFileSync(tempOutput, Buffer.concat(chunks));

  // Step 3: Trim output
  console.log("  3. Trimming output...");
  await trimSilence(tempOutput, outputPath);

  // Cleanup
  fs.unlinkSync(trimmedInput);
  fs.unlinkSync(tempOutput);

  console.log("  Done!\n");
}

async function main() {
  console.log("========================================");
  console.log("  Reconvert All Audio (Unified)");
  console.log("========================================\n");

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  const conversions = [
    { input: "01.m4a", output: "narration_01.mp3", desc: "01: 冷蔵庫の余り物が" },
    { input: "02.m4a", output: "narration_02.mp3", desc: "02: 今日の献立" },
    { input: "03.m4a", output: "narration_03.mp3", desc: "03: 今の気分と" },
    { input: "04.m4a", output: "narration_04.mp3", desc: "04: いつもの食材と" },
    { input: "05.m4a", output: "narration_05.mp3", desc: "05: プロのひと手間で" },
    { input: "06.m4a", output: "narration_06.mp3", desc: "06: 何気ない食卓も" },
  ];

  for (const c of conversions) {
    const inputPath = path.join(RECORDINGS_DIR, c.input);
    const outputPath = path.join(OUTPUT_DIR, c.output);
    await convertWithTrimming(inputPath, outputPath, c.desc);
  }

  console.log("========================================");
  console.log("  All Done!");
  console.log("========================================");
}

main().catch(console.error);

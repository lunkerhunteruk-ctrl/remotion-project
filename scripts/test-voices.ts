import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";

const API_KEY = "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";
const client = new ElevenLabsClient({ apiKey: API_KEY });

const RECORDINGS_DIR = path.join(__dirname, "../recordings");
const OUTPUT_DIR = path.join(__dirname, "../voice_tests");

function findRecordingFile(id: string): string | null {
  const extensions = [".mp3", ".m4a", ".wav", ".aac", ".ogg"];
  for (const ext of extensions) {
    const filePath = path.join(RECORDINGS_DIR, "rec_" + id + ext);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

async function convertWithVoice(inputPath: string, voiceId: string, voiceName: string, outputPath: string) {
  console.log("[Converting] " + voiceName);

  try {
    const audioData = fs.readFileSync(inputPath);

    const result = await client.speechToSpeech.convert(voiceId, {
      audio: new Blob([audioData], { type: "audio/mp4" }),
      modelId: "eleven_multilingual_sts_v2",
      outputFormat: "mp3_44100_128",
    });

    const chunks: Buffer[] = [];
    for await (const chunk of result) {
      chunks.push(Buffer.from(chunk));
    }

    fs.writeFileSync(outputPath, Buffer.concat(chunks));
    console.log("  Done: " + voiceName + ".mp3");
    return true;
  } catch (error: any) {
    console.error("  Error: " + error.message);
    return false;
  }
}

async function main() {
  console.log("========================================");
  console.log("  Voice Comparison Test");
  console.log("  Your voice x 10 Female Voices");
  console.log("========================================\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const inputPath = findRecordingFile("01");
  if (!inputPath) {
    console.log("Recording not found: rec_01");
    return;
  }
  console.log("Source: " + inputPath + "\n");

  const femaleVoices = [
    { voice_id: "fUjY9K2nAIwlALOwSiwc", name: "01_Yui" },
    { voice_id: "XB0fDUnXU5powFXDhCwa", name: "02_Charlotte" },
    { voice_id: "EXAVITQu4vr4xnSDxMaL", name: "03_Sarah" },
    { voice_id: "jBpfuIE2acCO8z3wKNLl", name: "04_Gigi" },
    { voice_id: "FGY2WhTYpPnrIDTdsKH5", name: "05_Laura" },
    { voice_id: "cgSgspJ2msm6clMCkdW9", name: "06_Jessica" },
    { voice_id: "Xb7hH8MSUJpSbSDYk0k2", name: "07_Alice" },
    { voice_id: "pFZP5JQG7iQjIQuC4Bku", name: "08_Lily" },
    { voice_id: "oWAxZDx7w5VEj9dCyTzz", name: "09_Grace" },
    { voice_id: "ThT5KcBeYPX3keUQqHPh", name: "10_Dorothy" },
  ];

  console.log("Testing 10 female voices:\n");

  for (const voice of femaleVoices) {
    const outputPath = path.join(OUTPUT_DIR, voice.name + ".mp3");
    await convertWithVoice(inputPath, voice.voice_id, voice.name, outputPath);
  }

  console.log("\n========================================");
  console.log("  Done!");
  console.log("  Output: voice_tests/");
  console.log("========================================\n");
}

main().catch(console.error);

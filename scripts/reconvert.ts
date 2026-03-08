import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";

const API_KEY = "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";
const VOICE_ID = "fUjY9K2nAIwlALOwSiwc"; // Yui
const client = new ElevenLabsClient({ apiKey: API_KEY });

async function convert(inputPath: string, outputPath: string, desc: string) {
  console.log("[Converting] " + desc);
  const audioData = fs.readFileSync(inputPath);
  const result = await client.speechToSpeech.convert(VOICE_ID, {
    audio: new Blob([audioData], { type: "audio/mp4" }),
    modelId: "eleven_multilingual_sts_v2",
    outputFormat: "mp3_44100_128",
  });
  const chunks: Buffer[] = [];
  for await (const chunk of result) {
    chunks.push(Buffer.from(chunk));
  }
  fs.writeFileSync(outputPath, Buffer.concat(chunks));
  console.log("  Done: " + outputPath);
}

async function main() {
  const recordingsDir = path.join(__dirname, "../recordings");
  const outputDir = path.join(__dirname, "../public/audio/short");
  
  // rec_04.m4a (プロの技で) → narration_05.mp3
  await convert(
    path.join(recordingsDir, "rec_04.m4a"),
    path.join(outputDir, "narration_05.mp3"),
    "rec_04 → narration_05 (プロの技で)"
  );
  
  // rec_05.m4a (おいしいを記録) → narration_06.mp3
  await convert(
    path.join(recordingsDir, "rec_05.m4a"),
    path.join(outputDir, "narration_06.mp3"),
    "rec_05 → narration_06 (おいしいを記録)"
  );
  
  console.log("\nDone! Now record rec_new.m4a for 具材を選んで...");
}

main().catch(console.error);

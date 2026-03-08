import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";

const API_KEY = "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";
const client = new ElevenLabsClient({ apiKey: API_KEY });

const RECORDINGS_DIR = path.join(__dirname, "../recordings");
const OUTPUT_DIR = path.join(__dirname, "../voice_tests");

const inputPath = path.join(RECORDINGS_DIR, "rec_01.m4a");
const voiceId = "0ptCJp0xgdabdcpVtCB5";
const outputPath = path.join(OUTPUT_DIR, "13_Custom.mp3");

async function main() {
  console.log("Converting with voice ID: " + voiceId);
  
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
  console.log("Done: 13_Custom.mp3");
}

main().catch(console.error);

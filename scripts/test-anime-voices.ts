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
  console.log("  Anime Voice Test");
  console.log("  Your voice x 10 Anime Female Voices");
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

  // Japanese anime female voices from library
  const animeVoices = [
    { voice_id: "EVmK7c3z026INySFvQLP", name: "03_Mio_Casual" },
    { voice_id: "lhTvHflPVOqgSWyuWQry", name: "04_Hina_Cute" },
    { voice_id: "JTlYtJrcTzPC71hMLOxo", name: "05_Yuki" },
    { voice_id: "ngvNHfiCrXLPAHcTrZK1", name: "06_Aki_Friendly" },
    { voice_id: "KgETZ36CCLD1Cob4xpkv", name: "07_Romaco_Cheerful" },
    { voice_id: "oAlEJuW30knHWhA6cF0e", name: "08_Itsuki_Anime" },
    { voice_id: "hMK7c1GPJmptCzI4bQIu", name: "09_Sameno_Inviting" },
    { voice_id: "yPWBURQS57P0VcJh4deb", name: "10_Lida_Aggressive" },
    { voice_id: "8kgj5469z1URcH4MB2G4", name: "11_Sakuya_Cheerful" },
    { voice_id: "wcs09USXSN5Bl7FXohVZ", name: "12_Miyu_Bright" },
  ];

  console.log("Testing 10 anime female voices:\n");

  for (const voice of animeVoices) {
    const outputPath = path.join(OUTPUT_DIR, voice.name + ".mp3");
    await convertWithVoice(inputPath, voice.voice_id, voice.name, outputPath);
  }

  console.log("\n========================================");
  console.log("  Done!");
  console.log("  Output: voice_tests/");
  console.log("========================================\n");
}

main().catch(console.error);

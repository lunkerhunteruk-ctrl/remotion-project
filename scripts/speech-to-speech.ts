import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic as string);

const API_KEY = "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";
const VOICE_ID = "fUjY9K2nAIwlALOwSiwc"; // Yui

const client = new ElevenLabsClient({ apiKey: API_KEY });

const RECORDINGS_DIR = path.join(__dirname, "../recordings");
const OUTPUT_DIR = path.join(__dirname, "../public/audio/short");
const TEMP_DIR = path.join(__dirname, "../temp");

// Expected recording files (supports mp3, m4a, wav)
const recordings = [
  { id: "01", output: "narration_01.mp3", text: "余り物が、神レシピに！？" },
  { id: "02", output: "narration_02.mp3", text: "毎日の献立、考えるのしんどい…" },
  { id: "03", output: "narration_03.mp3", text: "ピタレシなら具材を選ぶだけ！" },
  { id: "04", output: "narration_04.mp3", text: "プロの技で、サッと完成！" },
  { id: "05", output: "narration_05.mp3", text: "おいしいを記録しよう ピタレシで検索" },
];

// Find recording file with any supported extension
function findRecordingFile(id: string): string | null {
  const extensions = [".mp3", ".m4a", ".wav", ".aac", ".ogg"];
  for (const ext of extensions) {
    const filePath = path.join(RECORDINGS_DIR, `rec_${id}${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

// Trim silence from START and END only (not middle pauses)
async function trimSilence(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      // Strategy: trim start, then reverse, trim start again (which is the end), reverse back
      // This preserves pauses in the middle of speech
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

async function convertSpeechToSpeech(inputPath: string, outputPath: string, description: string) {
  console.log(`\n[Converting] ${description}`);
  console.log(`  Input:  ${inputPath}`);

  if (!fs.existsSync(inputPath)) {
    console.log(`  [Skip] File not found: ${inputPath}`);
    return false;
  }

  // Ensure temp directory exists
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  try {
    // Step 1: Trim silence from input
    const trimmedPath = path.join(TEMP_DIR, `trimmed_${path.basename(inputPath)}`);
    console.log(`  [Trimming silence]...`);
    await trimSilence(inputPath, trimmedPath);
    console.log(`  [Trimmed] → ${trimmedPath}`);

    // Step 2: Convert with ElevenLabs Speech-to-Speech
    const audioData = fs.readFileSync(trimmedPath);

    console.log(`  [Converting to Yui voice]...`);
    const result = await client.speechToSpeech.convert(VOICE_ID, {
      audio: new Blob([audioData], { type: "audio/mp4" }),
      modelId: "eleven_multilingual_sts_v2",
      outputFormat: "mp3_44100_128",
    });

    const chunks: Buffer[] = [];
    for await (const chunk of result) {
      chunks.push(Buffer.from(chunk));
    }

    // Step 3: Trim silence from output as well
    const tempOutputPath = path.join(TEMP_DIR, `temp_${path.basename(outputPath)}`);
    fs.writeFileSync(tempOutputPath, Buffer.concat(chunks));

    console.log(`  [Trimming output silence]...`);
    await trimSilence(tempOutputPath, outputPath);

    // Clean up temp files
    fs.unlinkSync(trimmedPath);
    fs.unlinkSync(tempOutputPath);

    console.log(`  [Success] → ${outputPath}`);
    return true;
  } catch (error: any) {
    console.error(`  [Error] ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("========================================");
  console.log("  Speech-to-Speech 変換");
  console.log("  あなたの声 → Yui の声");
  console.log("  + 無音自動カット機能");
  console.log("========================================");

  // Check which recordings exist
  const existingRecordings: Array<{ inputPath: string; output: string; text: string }> = [];

  for (const rec of recordings) {
    const inputPath = findRecordingFile(rec.id);
    if (inputPath) {
      existingRecordings.push({ inputPath, output: rec.output, text: rec.text });
    }
  }

  if (existingRecordings.length === 0) {
    console.log("\n録音ファイルが見つかりません。");
    console.log("\n以下のファイルを recordings/ フォルダに保存してください：\n");
    for (const rec of recordings) {
      console.log(`  rec_${rec.id}.mp3 (または .m4a, .wav) - 「${rec.text}」`);
    }
    console.log("\n対応形式: MP3, M4A, WAV, AAC, OGG");
    console.log("録音後、このスクリプトを再実行してください。");
    return;
  }

  console.log(`\n${existingRecordings.length}/${recordings.length} の録音ファイルを検出\n`);

  let successCount = 0;
  for (const rec of existingRecordings) {
    const outputPath = path.join(OUTPUT_DIR, rec.output);

    const success = await convertSpeechToSpeech(rec.inputPath, outputPath, rec.text);
    if (success) successCount++;
  }

  console.log("\n========================================");
  console.log(`  完了: ${successCount}/${existingRecordings.length} 変換成功`);
  console.log("========================================\n");

  if (successCount > 0) {
    console.log("次のステップ:");
    console.log("  npm run render-short");
  }
}

main().catch(console.error);

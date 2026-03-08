import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const API_KEY = "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";
const client = new ElevenLabsClient({ apiKey: API_KEY });

async function main() {
  console.log("Searching Voice Library for anime Japanese female voices...\n");

  // Search for anime Japanese voices
  const result = await client.voices.search({
    searchTerm: "anime japanese girl",
  });
  
  console.log("=== Anime Japanese Female Voices ===\n");
  
  const voices = result.voices || [];
  voices.slice(0, 20).forEach((v: any, i: number) => {
    console.log((i+1) + ". " + v.name);
    console.log("   ID: " + v.voice_id);
    if (v.labels) {
      const labels = v.labels;
      console.log("   Gender: " + (labels.gender || "?") + ", Language: " + (labels.language || "?"));
    }
    console.log("");
  });
}

main().catch(console.error);

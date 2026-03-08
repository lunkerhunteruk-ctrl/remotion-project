import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const API_KEY = "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";
const client = new ElevenLabsClient({ apiKey: API_KEY });

async function main() {
  console.log("Searching for anime/Japanese female voices...\n");

  const voices = await client.voices.getAll();
  
  const animeVoices = voices.voices.filter(v => {
    const labels = v.labels || {};
    const name = (v.name || "").toLowerCase();
    const desc = (v.description || "").toLowerCase();
    
    // Look for anime, Japanese, young female characteristics
    const isAnime = 
      labels.accent === "japanese" ||
      labels.accent === "Japanese" ||
      name.includes("anime") ||
      name.includes("japanese") ||
      desc.includes("anime") ||
      desc.includes("japanese") ||
      desc.includes("young") ||
      desc.includes("cute") ||
      desc.includes("sweet") ||
      labels["use case"]?.includes("characters") ||
      labels["use case"]?.includes("animation");
    
    const isFemale = labels.gender === "female";
    
    return isFemale;
  });

  console.log("Female voices found: " + animeVoices.length + "\n");
  
  animeVoices.slice(0, 30).forEach((v, i) => {
    const labels = v.labels || {};
    console.log((i+1) + ". " + v.name + " (" + v.voice_id + ")");
    console.log("   Accent: " + (labels.accent || "N/A") + ", Age: " + (labels.age || "N/A"));
    console.log("   Desc: " + (v.description || "").substring(0, 60));
    console.log("");
  });
}

main().catch(console.error);

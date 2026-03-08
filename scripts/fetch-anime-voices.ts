const API_KEY = "sk_694680a6f6832afad1bbe5c49cac5d5947d2864a4c4ec132";

async function main() {
  console.log("Fetching anime voices from ElevenLabs Library...\n");

  // Search shared voices library
  const response = await fetch(
    "https://api.elevenlabs.io/v1/shared-voices?page_size=50&search=anime%20japanese%20female&gender=female&language=ja",
    {
      headers: {
        "xi-api-key": API_KEY,
      },
    }
  );

  const data = await response.json();
  
  if (data.voices && data.voices.length > 0) {
    console.log("Found " + data.voices.length + " voices:\n");
    
    data.voices.slice(0, 20).forEach((v: any, i: number) => {
      console.log((i+1) + ". " + v.name);
      console.log("   public_owner_id: " + v.public_owner_id);
      console.log("   voice_id: " + v.voice_id);
      console.log("   category: " + v.category);
      console.log("");
    });
  } else {
    console.log("No voices found. Trying broader search...");
    
    // Try broader search
    const response2 = await fetch(
      "https://api.elevenlabs.io/v1/shared-voices?page_size=50&gender=female&language=ja",
      {
        headers: {
          "xi-api-key": API_KEY,
        },
      }
    );
    
    const data2 = await response2.json();
    console.log("\nJapanese female voices:");
    
    if (data2.voices) {
      data2.voices.slice(0, 20).forEach((v: any, i: number) => {
        console.log((i+1) + ". " + v.name + " (" + v.voice_id + ")");
      });
    }
  }
}

main().catch(console.error);

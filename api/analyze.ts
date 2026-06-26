import { GoogleGenAI, Type } from "@google/genai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Intelligent local rule-based fallback analyzer to handle temporary AI service outages beautifully
function analyzeLocally(note: string, image: boolean) {
  const text = (note || "").toLowerCase();
  
  let service = "Handyman";
  let type = "Home Maintenance Issue";
  let urgency: "Low" | "Medium" | "High" = "Medium";

  // Category detection
  if (
    text.includes("leak") || 
    text.includes("pipe") || 
    text.includes("water") || 
    text.includes("faucet") || 
    text.includes("clog") || 
    text.includes("drain") || 
    text.includes("sink") || 
    text.includes("dripping") || 
    text.includes("toilet") || 
    text.includes("flush") || 
    text.includes("plumb") || 
    text.includes("shower") || 
    text.includes("tub") || 
    text.includes("hose") || 
    text.includes("valve")
  ) {
    service = "Plumbing";
    if (text.includes("leak")) type = "Water Leak Repair";
    else if (text.includes("clog") || text.includes("drain")) type = "Clogged Drain Cleansing";
    else if (text.includes("faucet") || text.includes("dripping")) type = "Faucet Repair & Tuning";
    else if (text.includes("toilet")) type = "Toilet Plumbing Fix";
    else type = "Plumbing Pipe Fix";
  } else if (
    text.includes("wire") || 
    text.includes("shock") || 
    text.includes("outlet") || 
    text.includes("switch") || 
    text.includes("short") || 
    text.includes("breaker") || 
    text.includes("fuse") || 
    text.includes("plug") || 
    text.includes("light") || 
    text.includes("bulb") || 
    text.includes("electrical") || 
    text.includes("socket") || 
    text.includes("power") || 
    text.includes("electric")
  ) {
    service = "Electrical";
    if (text.includes("light") || text.includes("bulb")) type = "Lighting Fixture Fix";
    else if (text.includes("outlet") || text.includes("socket") || text.includes("plug")) type = "Electrical Outlet Service";
    else if (text.includes("breaker") || text.includes("fuse") || text.includes("short")) type = "Circuit Breaker Diagnostic";
    else type = "Electrical System Repair";
  } else if (
    text.includes("door") || 
    text.includes("lock") || 
    text.includes("cabinet") || 
    text.includes("wood") || 
    text.includes("chair") || 
    text.includes("table") || 
    text.includes("hinge") || 
    text.includes("window") || 
    text.includes("furniture") || 
    text.includes("drawer") || 
    text.includes("creak") || 
    text.includes("carpentry") || 
    text.includes("deck") || 
    text.includes("shelf") || 
    text.includes("shelves")
  ) {
    service = "Carpentry";
    if (text.includes("lock")) type = "Lock Security Repair";
    else if (text.includes("door")) type = "Door Frame Alignment";
    else if (text.includes("cabinet") || text.includes("hinge")) type = "Cabinet Hinge Repair";
    else type = "Custom Carpentry Tuning";
  } else if (
    text.includes("paint") || 
    text.includes("wall") || 
    text.includes("drywall") || 
    text.includes("peel") || 
    text.includes("stain") || 
    text.includes("painting") || 
    text.includes("wallpaper")
  ) {
    service = "Painting";
    type = "Drywall Patching & Paint Touch-up";
  } else if (
    text.includes("fridge") || 
    text.includes("refrigerator") || 
    text.includes("oven") || 
    text.includes("stove") || 
    text.includes("microwave") || 
    text.includes("appliance") || 
    text.includes("dryer") || 
    text.includes("washer") || 
    text.includes("dishwasher") || 
    text.includes("freezer")
  ) {
    service = "Appliance";
    if (text.includes("fridge") || text.includes("refrigerator")) type = "Refrigerator System Diagnostics";
    else if (text.includes("washer") || text.includes("drying")) type = "Washing Machine Repairs";
    else type = "Home Appliance Repair";
  } else if (
    text.includes("tile") || 
    text.includes("crack") || 
    text.includes("cement") || 
    text.includes("brick") || 
    text.includes("mason") || 
    text.includes("stone") || 
    text.includes("plaster")
  ) {
    service = "Masonry";
    type = "Surface Crack Masonry Repair";
  }

  // Squeeze more realistic title from user note
  if (note && note.trim().length > 3) {
    const clean = note.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const words = clean.split(/\s+/);
    if (words.length > 0) {
      const titleWords = words.slice(0, 4);
      let noteBasedTitle = titleWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      if (words.length > 4) noteBasedTitle += "...";
      type = noteBasedTitle;
    }
  }

  // Urgency detection
  if (
    text.includes("urgent") || 
    text.includes("emergency") || 
    text.includes("burst") || 
    text.includes("flood") || 
    text.includes("shock") || 
    text.includes("fire") || 
    text.includes("smoke") || 
    text.includes("hazard") || 
    text.includes("risk") || 
    text.includes("immediate") || 
    text.includes("asap") || 
    text.includes("dangerous") || 
    text.includes("rapidly") || 
    text.includes("flowing") || 
    text.includes("overflow") || 
    text.includes("severe") || 
    text.includes("spreading")
  ) {
    urgency = "High";
  } else if (
    text.includes("slow") || 
    text.includes("minor") || 
    text.includes("creak") || 
    text.includes("loose") || 
    text.includes("paint") || 
    text.includes("aesthetic") || 
    text.includes("cosmetic") || 
    text.includes("bulb")
  ) {
    urgency = "Low";
  } else {
    urgency = "Medium";
  }

  return { type, service, urgency };
}

export default async function handler(req: any, res: any) {
  // Simple CORS handling
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { image, note } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("API key is missing on the server. Falling back to local analyzer.");
      return res.status(200).json({
        ...analyzeLocally(note, !!image),
        isFallback: true,
        reason: "GEMINI_API_KEY is missing in your environment variables."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const contents: any[] = [];

    if (image) {
      const base64Parts = image.split(',');
      if (base64Parts.length > 1) {
        const data = base64Parts[1];
        const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
        contents.push({
          inlineData: {
            mimeType,
            data
          }
        });
      }
    }

    contents.push({
      text: `Analyze this home repair issue based on the provided image and user note. 
      User Note: "${note || 'No note provided'}"
      
      Return a JSON object with the following fields:
      - type: A specific name for the problem (e.g., "Leaky Kitchen Faucet", "Clogged Drain")
      - service: The general category of professional needed (e.g., "Plumbing", "Electrical", "Carpentry")
      - urgency: One of "Low", "Medium", "High"
      
      Be as accurate and specific as possible.`
    });

    // Up to 3 attempts with alternate models and progressive backoff to handle temporary 503 unavailability
    let lastError: any = null;
    const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-3.5-flash"];
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      const selectedModel = modelsToTry[attempt - 1];
      try {
        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: { parts: contents },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                service: { type: Type.STRING },
                urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
              },
              required: ["type", "service", "urgency"]
            }
          }
        });

        if (response && response.text) {
          const result = JSON.parse(response.text.trim());
          return res.status(200).json({
            ...result,
            isFallback: false
          });
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini API attempt ${attempt} with model ${selectedModel} failed:`, err.message || err);
        if (attempt < 3) {
          await sleep(attempt * 400); // 400ms, then 800ms
        }
      }
    }

    // If retries failed, fall back to high-quality local analysis rather than throwing error
    console.warn("All Gemini API attempts failed. Using local diagnostic fallback handler. Error:", lastError);
    return res.status(200).json({
      ...analyzeLocally(note, !!image),
      isFallback: true,
      reason: `Gemini API service was temporarily overloaded or returned an error: ${lastError?.message || lastError}`
    });

  } catch (error: any) {
    console.error("Critical API processor error, falling back locally:", error);
    try {
      return res.status(200).json({
        ...analyzeLocally(note, !!image),
        isFallback: true,
        reason: `Critical API error: ${error.message || error}`
      });
    } catch (fallbackErr) {
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
}

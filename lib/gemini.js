const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

const basePrompt = `You are a professional meeting preparation assistant.
Your job is to synthesize public information about a person into a concise, useful brief tailored to a specific interaction.

The user is meeting: [NAME]
Context: [USER'S CONTEXT]

Here is public information gathered about this person:
[RAW EXA RESULTS]

Return ONLY a valid JSON object with exactly these fields:
{
  "whoTheyAre": "3-4 sentence career and background summary written conversationally, not like a Wikipedia article",
  "whatTheyCareAbout": "2-3 sentences on recurring themes in their work, writing, or public statements",
  "recentActivity": "2-3 sentences on what they have been publicly focused on lately",
  "conversationStarters": [
    "Specific starter 1 tied to something real they said or did",
    "Specific starter 2",
    "Specific starter 3"
  ],
  "commonGround": "1-2 sentences on potential shared interests or overlapping experiences",
  "watchOut": "One subtle flag if relevant, otherwise return null"
}

Rules:
- Be specific, not generic. Every sentence should feel like it could only be about this exact person
- If public information is limited, be honest about it and do not fabricate any details
- Do not include any text outside the JSON object, no markdown, no explanation, just raw JSON
- Conversation starters must reference something the person actually said, wrote, or did publicly`;

export function extractJsonFromGemini(text) {
  const cleaned = text.replace(/```json\s*|```/gi, "").trim();
  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    return cleaned;
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

function buildPrompt(name, context, rawResults) {
  return basePrompt
    .replace("[NAME]", name)
    .replace("[USER'S CONTEXT]", context)
    .replace("[RAW EXA RESULTS]", rawResults);
}

export async function synthesizeBrief({ name, context, rawResults }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const prompt = buildPrompt(name, context, rawResults);
  let lastError = null;

  for (const model of MODEL_CANDIDATES) {
    const response = await fetch(
      `${GEMINI_API_BASE}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            responseMimeType: "application/json"
          }
        }),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      const details = await response.text();
      const modelMissing =
        response.status === 404 &&
        details.includes("is not found for API version") &&
        details.includes("generateContent");

      if (modelMissing) {
        lastError = `Model unavailable: ${model}`;
        continue;
      }

      throw new Error(`Gemini synthesis failed (${response.status}): ${details}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      const promptReason = data?.promptFeedback?.blockReason;
      if (promptReason) {
        throw new Error(`Gemini blocked the response: ${promptReason}`);
      }
      throw new Error("Gemini returned an empty response.");
    }

    const jsonText = extractJsonFromGemini(text);

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      throw new Error(`Failed to parse Gemini JSON response: ${error.message}`);
    }
  }

  throw new Error(
    `No compatible Gemini model found for generateContent. Tried: ${MODEL_CANDIDATES.join(", ")}. ${lastError || ""}`.trim()
  );
}

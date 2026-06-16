import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractJsonArray(text) {
  if (!text) return [];

  const safeText = String(text)
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = safeText.indexOf("[");
  const end = safeText.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    console.log("❌ NO JSON FOUND IN RESPONSE:");
    console.log(safeText);
    return [];
  }

  const jsonString = safeText.slice(start, end + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.log("❌ JSON PARSE ERROR:");
    console.log(jsonString);
    return [];
  }
}

export async function generate(prompt, config) {
  try {
    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens || 8000,
      temperature: config.temperature ?? 0.2,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: String(prompt),
            },
          ],
        },
      ],
    });

    console.log("RAW ANTHROPIC RESPONSE:");
    console.log(JSON.stringify(response, null, 2));

    const text = response.content?.length
      ? response.content.map((b) => b.text).join("")
      : "";

    if (!text || typeof text !== "string") {
      console.log("❌ EMPTY OR INVALID RESPONSE TEXT");
      return [];
    }

    const result = extractJsonArray(text);

    if (!Array.isArray(result)) {
      console.log("❌ RESULT IS NOT ARRAY");
      return [];
    }

    return result;

  } catch (err) {
    console.error("❌ ANTHROPIC ERROR:", err);
    return [];
  }
}
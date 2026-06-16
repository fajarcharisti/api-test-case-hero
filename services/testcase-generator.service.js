import fs from "fs";
import path from "path";

function sanitizeInput(value, fallback) {
  if (value === null || value === undefined) {
    return fallback;
  }

  const str = typeof value === "string"
    ? value
    : JSON.stringify(value);

  return str
    .replace(/```/g, "")
    .replace(/\{\{/g, "[[")
    .replace(/\}\}/g, "]]")
    .trim();
}

export function buildPrompt({ story = "", contract = "" } = {}) {
  let promptPath = "./prompts/combined.prompt.md";

  if (story && !contract) {
    promptPath = "./prompts/story.prompt.md";
  }

  if (!story && contract) {
    promptPath = "./prompts/contract.prompt.md";
  }

  const template = fs.readFileSync(
    path.resolve(promptPath),
    "utf8"
  );

  if (typeof template !== "string") {
    throw new Error("Prompt template is not a string");
  }

  const safeStory = sanitizeInput(story, "[NO_STORY_PROVIDED]");
  const safeContract = sanitizeInput(contract, "[NO_CONTRACT_PROVIDED]");

  return template
    .replaceAll("{{STORY}}", safeStory)
    .replaceAll("{{CONTRACT}}", safeContract);
}
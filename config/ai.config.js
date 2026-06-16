import dotenv from "dotenv";

dotenv.config({
  quiet: true
});

export default {
  model: process.env.ANTHROPIC_MODEL,
  temperature: 0.2,
  maxTokens: 8000
};
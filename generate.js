import ora from "ora";

import aiConfig from "./config/ai.config.js";

import { readFile } from "./utils/file.reader.js";

import { generate } from "./services/ai.services.js";

import { buildPrompt } from "./services/testcase-generator.service.js";

import { exportExcel } from "./services/excel-export.service.js";

function formatBDDSteps(steps) {
  if (!steps || typeof steps !== "string") return "";

  return steps
    .replace(/\s+Given/gi, "\nGiven")
    .replace(/\s+When/gi, "\n\nWhen")
    .replace(/\s+Then/gi, "\n\nThen")
    .replace(/\s+And/gi, "\nAnd")
    .trim();
}

(async () => {
  try {
    console.log("");
    console.log("🚀 API Test Case Hero");
    console.log("");

    console.log("📖 Reading Inputs...");

    const story = readFile("./input/story.txt");
    const contract = readFile("./input/contract.yaml");

    if (story) console.log("✅ story.txt loaded");
    if (contract) console.log("✅ contract.yaml loaded");

    console.log("");

    const mode = story && contract
      ? "COMBINED"
      : story
      ? "STORY"
      : "CONTRACT";

    console.log(`🧠 Mode Detected: ${mode}`);
    console.log("");

    const prompt = buildPrompt({ story, contract });

    const aiSpinner = ora(
      `Generating test cases using ${aiConfig.model}...`
    ).start();

    const response = await generate(prompt, aiConfig);

    aiSpinner.succeed("Test cases generated successfully");

    console.log("");

    if (!Array.isArray(response)) {
      throw new Error("AI response is not an array");
    }

    const testCases = response.map((testCase) => ({
      ...testCase,
      steps: formatBDDSteps(testCase.steps),
    }));

    const exportSpinner = ora("Exporting Excel...").start();

    await exportExcel(testCases);

    exportSpinner.succeed(
      "api-testcases-generated.xlsx created"
    );

    const positive = testCases.filter(tc =>
      tc.testType?.toLowerCase().includes("positive")
    ).length;

    const negative = testCases.filter(tc =>
      tc.testType?.toLowerCase().includes("negative")
    ).length;

    const nonFunctional = testCases.filter(tc =>
      tc.testType?.toLowerCase().includes("non")
    ).length;

    console.log("");
    console.log("══════════════════════════════");
    console.log("");
    console.log("🎉 GENERATION COMPLETED");
    console.log("");
    console.log(`📌 Total Test Cases : ${testCases.length}`);
    console.log("");
    console.log("📈 Breakdown");
    console.log(`   ✅ Positive       : ${positive}`);
    console.log(`   ❌ Negative       : ${negative}`);
    console.log(`   ⚡ Non Functional : ${nonFunctional}`);
    console.log("");
    console.log("📄 Excel Output");
    console.log("   output/api-testcases-generated.xlsx");
    console.log("");

  } catch (error) {
    console.log("");
    console.error("❌ Generation Failed");
    console.error("");
    console.error(error.message);
    console.log("");

    process.exit(1);
  }
})();
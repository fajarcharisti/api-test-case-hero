import fs from "fs";

export function readFile(filePath) {

  if (
    !fs.existsSync(filePath)
  ) {
    return null;
  }

  const content =
    fs.readFileSync(
      filePath,
      "utf-8"
    );

  return content.trim();
}
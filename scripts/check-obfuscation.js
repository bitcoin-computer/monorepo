#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, existsSync, rmSync } from "node:fs";
import { dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

process.on("unhandledRejection", (err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptDir = resolve(__dirname);
const packagesDir = resolve(scriptDir, "../packages");
let failed = 0;

const FOLDER = "dist/";

console.log("Checking obfuscation...");

// Check dist folders
for (const folder of [`${packagesDir}/lib/dist`, `${packagesDir}/node/dist`]) {
  try {
    const files = execSync(`ls ${folder}/*.*`, { encoding: "utf8" })
      .trim()
      .split("\n");

    for (const file of files) {
      if (!existsSync(file)) continue;

      const buf = readFileSync(file);
      const snippet = buf.subarray(0, 1024).toString("utf8");
      if (snippet.includes("  ")) {
        console.error(`Obfuscation failed for ${file}`);
        failed = 1;
      }
    }
  } catch {
    // Skip if folder doesn't exist
  }
}
// Check staged files in dist folders
let stagedFiles = "";
try {
  stagedFiles = execSync(`git diff --cached --name-only --diff-filter=ACM`, {
    encoding: "utf8",
  })
    .split("\n")
    .filter((f) => f.includes(FOLDER) && f.trim().length > 0);
} catch {
  stagedFiles = [];
}

for (const file of stagedFiles) {
  if (!existsSync(file)) continue;

  let stagedContent;
  try {
    stagedContent = execSync(`git show ":${file}"`, { encoding: "utf8" });
  } catch {
    continue;
  }

  const snippet = stagedContent.slice(0, 1024);
  if (snippet.includes("  ")) {
    console.error(`Obfuscation failed for staged file: ${file}`);
    throw new Error("Staged file is not obfuscated");
    failed = 1;
  }
}

if (failed) {
  console.error("Obfuscation check FAILED");
  process.exit(1);
} else {
  console.log("Obfuscation check PASSED");
  process.exit(0);
}

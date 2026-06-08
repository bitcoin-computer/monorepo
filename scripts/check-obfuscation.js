#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

process.on("unhandledRejection", (err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptDir = resolve(__dirname);
const packagesDir = resolve(scriptDir, "../packages");

const distPaths = [
  resolve(packagesDir, "lib/dist"),
  resolve(packagesDir, "node/dist"),
];

let failed = 0;

console.log("Checking obfuscation...");

// 1. Check the built dist folders on disk (lib + node only)
for (const distPath of distPaths) {
  try {
    // Use `find` so it also works if there are subfolders
    const files = execSync(`find "${distPath}" -type f -name "*.*"`, {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);

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
    // Folder doesn't exist or is empty → skip
  }
}

// 2. Check staged files — BUT ONLY in the two target dist folders
let stagedFiles = [];
try {
  const allStaged = execSync(
    `git diff --cached --name-only --diff-filter=ACM`,
    {
      encoding: "utf8",
    }
  )
    .trim()
    .split("\n")
    .filter(Boolean);

  stagedFiles = allStaged.filter((file) => {
    const absPath = resolve(file); // make it absolute so it works regardless of cwd
    return distPaths.some(
      (distPath) => absPath === distPath || absPath.startsWith(distPath + "/")
    );
  });
} catch {
  // no staged files or git not available
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

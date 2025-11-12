#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// ANSI color codes for red/green output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

const cwd = process.cwd();

// Load environment variables from .env
const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const envFile = resolve(__dirname, "../packages/node/.env");
if (existsSync(envFile)) {
  const result = dotenv.config({ path: envFile });
  if (result.error) {
    console.error("Failed to load .env:", result.error);
  }
} else {
  console.warn(`.env file not found at ${envFile}`);
}

// Adjust for host environment if running outside Docker
if (process.env.POSTGRES_HOST === "db") {
  process.env.POSTGRES_HOST = "127.0.0.1";
  process.env.BITCOIN_RPC_HOST = "127.0.0.1";
  process.env.BCN_ZMQ_URL = "tcp://127.0.0.1:28332";
}

function getTestResultsFiles() {
  const results = [];

  // Case 1: run inside a specific package
  const localFile = join(cwd, "test-results.json");
  if (existsSync(localFile)) return [localFile];

  // Case 2: run from monorepo root
  const packagesDir = join(cwd, "packages");
  if (!existsSync(packagesDir)) return results;

  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const file = join(packagesDir, entry.name, "test-results.json");
      if (existsSync(file)) results.push(resolve(file));
    }
  }

  return results;
}

const testResultsFiles = getTestResultsFiles();

if (testResultsFiles.length === 0) {
  console.error(
    `${colors.red}No test-results.json files found.${colors.reset}`
  );
  process.exit(1);
}

for (const testResultsFile of testResultsFiles) {
  const packageDir = testResultsFile.replace(/\/test-results\.json$/, "");
  console.log(`Processing package: ${packageDir}`);

  try {
    const raw = readFileSync(testResultsFile, "utf8").trim();

    if (!raw) {
      console.error(
        `${colors.red}Error: ${testResultsFile} is empty.${colors.reset}`
      );
      continue;
    }

    let results;
    try {
      results = JSON.parse(raw);
    } catch (parseError) {
      console.error(
        `${colors.red}Error: Failed to parse ${testResultsFile} — invalid JSON.${colors.reset}`
      );
      continue;
    }

    if (!Array.isArray(results.failures)) {
      console.error(
        `${colors.red}Error: ${testResultsFile} does not contain a "failures" array.${colors.reset}`
      );
      continue;
    }

    const validFailures = results.failures.filter(
      (failure) => failure.file && (failure.fullTitle || failure.title)
    );
    if (validFailures.length === 0) {
      console.log(
        `${colors.green}No failures in ${packageDir}.${colors.reset}`
      );
      continue;
    }

    const failedTests = validFailures.map((failure) => {
      let cleanedTitle = (failure.fullTitle || failure.title)
        .replace(/"before all" hook:.*?for\s*"/, "")
        .replace(/"before each" hook:.*?for\s*"/, "")
        .replace(/\\"/g, '"')
        .replace(/"/g, "")
        .trim();
      return { file: failure.file, title: cleanedTitle };
    });

    console.log(
      `Rerunning ${failedTests.length} failed tests in ${packageDir}.`
    );

    const escapedTitles = failedTests
      .map((test) => test.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .filter((title) => title.trim() !== "");

    if (escapedTitles.length === 0) {
      console.error(
        `${colors.red}No valid test titles found for --grep in ${packageDir}.${colors.reset}`
      );
      continue;
    }

    const grepPattern = escapedTitles.join("|");
    const failedFiles = [...new Set(failedTests.map((test) => test.file))];

    const mochaCommand = `mocha --config .mocharc.json --grep "${grepPattern}" ${failedFiles.join(" ")}`;
    console.log(`Running command in ${packageDir}: ${mochaCommand}`);

    execSync(mochaCommand, {
      cwd: packageDir,
      stdio: "inherit",
      env: Object.fromEntries(
        Object.entries(process.env).map(([k, v]) => [k, String(v ?? "")])
      ),
    });
  } catch (error) {
    console.error(
      `${colors.red}Error processing ${testResultsFile}: ${error.message}${colors.reset}`
    );
  }
}

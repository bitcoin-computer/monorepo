#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, unlinkSync } from "fs";
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
  console.log(`${colors.green}No failed tests to rerun.${colors.reset}`);
  process.exit(0);
}

let hasError = false;

for (const testResultsFile of testResultsFiles) {
  const packageDir = testResultsFile.replace(/\/test-results\.json$/, "");
  console.log(`Processing package: ${packageDir}`);

  try {
    const raw = readFileSync(testResultsFile, "utf8").trim();

    if (!raw) {
      console.error(
        `${colors.red}Error: ${testResultsFile} is empty.${colors.reset}`
      );
      hasError = true;
      continue;
    }

    let results;
    try {
      results = JSON.parse(raw);
    } catch (parseError) {
      console.error(
        `${colors.red}Error: Failed to parse ${testResultsFile} — invalid JSON.${colors.reset}`
      );
      hasError = true;
      continue;
    }

    if (!Array.isArray(results.failures)) {
      console.error(
        `${colors.red}Error: ${testResultsFile} does not contain a "failures" array.${colors.reset}`
      );
      hasError = true;
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
      hasError = true;
      continue;
    }

    const grepPattern = escapedTitles.join("|");
    const failedFiles = [...new Set(failedTests.map((test) => test.file))];

    // Recompile before rerun
    try {
      execSync("npm run compile:test --if-present --workspaces", {
        cwd: packageDir,
        stdio: "inherit",
      });
    } catch (compileError) {
      console.warn(
        `${colors.yellow}Warning: Compilation step failed or skipped: ${compileError.message}${colors.reset}`
      );
    }

    const mochaCommand = `mocha --config .mocharc.json --grep "${grepPattern}" ${failedFiles.join(" ")}`;
    console.log(`Running command in ${packageDir}: ${mochaCommand}`);

    execSync(mochaCommand, {
      cwd: packageDir,
      stdio: "inherit",
      env: Object.fromEntries(
        Object.entries(process.env).map(([k, v]) => [k, String(v ?? "")])
      ),
    });

    // After successful rerun, check if failures are cleared and delete json if no failures remain
    console.log(
      `${colors.green}Rerun completed for ${packageDir}. Checking for remaining failures.${colors.reset}`
    );
    const updatedRaw = readFileSync(testResultsFile, "utf8").trim();
    if (updatedRaw) {
      try {
        const updatedResults = JSON.parse(updatedRaw);
    
        if (
          Array.isArray(updatedResults.failures) &&
          updatedResults.failures.length > 0
        ) {
          hasError = true;
          console.log(
            `${colors.red}Remaining failures in ${testResultsFile}; marking as error.${colors.reset}`
          );
        }
    
        if (
          Array.isArray(updatedResults.failures) &&
          updatedResults.failures.length === 0
        ) {
          unlinkSync(testResultsFile);
          console.log(
            `${colors.green}No remaining failures; cleared ${testResultsFile}.${colors.reset}`
          );
        }
      } catch (parseError) {
        console.error(
          `${colors.red}Failed to parse updated ${testResultsFile} for cleanup.${colors.reset}`
        );
        hasError = true;
      }
    }
  } catch (error) {
    console.error(
      `${colors.red}Error processing ${testResultsFile}: ${error.message}${colors.reset}`
    );
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

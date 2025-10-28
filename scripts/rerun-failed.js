import { existsSync, readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";

// ANSI color codes for red/green output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

const cwd = process.cwd();

// Generic environment variables for all packages
const envVars =
  "POSTGRES_HOST=127.0.0.1 BITCOIN_RPC_HOST=127.0.0.1 BCN_ZMQ_URL=tcp://127.0.0.1:28332";

function getTestResultsFiles() {
  const results = [];

  // Case 1: run inside a specific package
  const localFile = join(cwd, "test-results.json");
  if (existsSync(localFile)) return [localFile];

  // Case 2: run from monorepo root
  const packagesDir = join(cwd, "packages");
  if (!existsSync(packagesDir)) return results;

  // Read each direct subdirectory in packages/
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

testResultsFiles.forEach((testResultsFile) => {
  const packageDir = testResultsFile.replace(/\/test-results\.json$/, "");
  console.log(`Processing package: ${packageDir}`);

  try {
    const results = JSON.parse(readFileSync(testResultsFile, "utf8"));
    if (!Array.isArray(results.failures)) {
      console.error(
        `${colors.red}Error: ${testResultsFile} does not contain a "failures" array.${colors.reset}`
      );
      return;
    }
    const validFailures = results.failures.filter(
      (failure) => failure.file && (failure.fullTitle || failure.title)
    );
    if (validFailures.length === 0) {
      console.log(
        `${colors.green}No failures in ${packageDir}.${colors.reset}`
      );
      return;
    }

    // Clean up titles by removing "before all" or "before each" hooks
    const failedTests = validFailures.map((failure) => {
      let cleanedTitle = (failure.fullTitle || failure.title)
        .replace(/"before all" hook:.*?for\s*"/, "") // Remove "before all" hook part
        .replace(/"before each" hook:.*?for\s*"/, "") // Remove "before each" hook part
        .replace(/\\"/g, '"') // Remove escaped quotes from title
        .replace(/"/g, "") // Remove unescaped quotes to prevent shell issues
        .trim();
      return {
        file: failure.file,
        title: cleanedTitle,
      };
    });

    console.log(
      `Rerunning ${failedTests.length} failed tests in ${packageDir}.`
    );

    // Escape titles for regex and shell
    const escapedTitles = failedTests
      .map((test) => {
        // Escape special regex characters for Mocha's --grep
        const regexEscaped = test.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return regexEscaped;
      })
      .filter((title) => title.trim() !== "");
    if (escapedTitles.length === 0) {
      console.error(
        `${colors.red}No valid test titles found for --grep in ${packageDir}.${colors.reset}`
      );
      return;
    }
    const grepPattern = escapedTitles.join("|");
    const failedFiles = [...new Set(failedTests.map((test) => test.file))];

    // Run Mocha with default .mocharc.json (json reporter)
    const mochaCommand = `${envVars} mocha --config .mocharc.json --grep "${grepPattern}" ${failedFiles.join(" ")}`;
    console.log(`Running command in ${packageDir}: ${mochaCommand}`);

    try {
      execSync(mochaCommand, { cwd: packageDir, stdio: "inherit" });
    } catch (mochaError) {
      console.error(
        `${colors.red}Mocha command failed in ${packageDir}: ${mochaError.message}${colors.reset}`
      );
    }
  } catch (error) {
    console.error(
      `${colors.red}Error processing ${testResultsFile}: ${error.message}${colors.reset}`
    );
  }
});

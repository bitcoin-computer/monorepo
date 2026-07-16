#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { execSync } from "child_process";
import * as glob from "glob";

// ANSI color codes
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

const cwd = process.cwd();
const envVars =
  "POSTGRES_HOST=127.0.0.1 BITCOIN_RPC_HOST=127.0.0.1 BCN_ZMQ_URL=tcp://127.0.0.1:28332";

function getPackageDir(testFile) {
  let dir = dirname(testFile);
  while (dir && dir !== cwd && dir !== "/") {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return cwd; // fallback
}

function getTestResultsFiles() {
  let testResultsFiles = [];

  if (existsSync(join(cwd, "test-results.json"))) {
    testResultsFiles.push(join(cwd, "test-results.json"));
  }

  if (existsSync(join(cwd, "packages"))) {
    const packageDirs = glob.sync(join(cwd, "packages/*/"), { absolute: true });
    const packageTestResults = packageDirs
      .map((dir) => join(dir, "test-results.json"))
      .filter(existsSync);
    testResultsFiles = [...testResultsFiles, ...packageTestResults];
  }

  return testResultsFiles;
}

const testResultsFiles = getTestResultsFiles();

if (testResultsFiles.length === 0) {
  console.error(
    `${colors.red}No test-results.json files found.${colors.reset}`
  );
  process.exit(1);
}

console.log("Found test-results files:", testResultsFiles);

testResultsFiles.forEach((testResultsFile) => {
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
        `${colors.green}No failures in ${testResultsFile}.${colors.reset}`
      );
      return;
    }

    // Clean titles
    const failedTests = validFailures.map((failure) => {
      let cleanedTitle = failure.fullTitle || failure.title;

      if (cleanedTitle.includes('"before each" hook')) {
        const match = cleanedTitle.match(/(.*?)\s*"before each" hook/);
        if (match && match[1]) cleanedTitle = match[1].trim();
      } else if (cleanedTitle.includes('"before all" hook')) {
        cleanedTitle = cleanedTitle
          .replace(/"before all" hook:.*?for\s*"/, "")
          .replace(/\\"/g, '"')
          .replace(/"/g, "")
          .trim();
      } else {
        cleanedTitle = cleanedTitle
          .replace(/\\"/g, '"')
          .replace(/"/g, "")
          .trim();
      }

      return { file: failure.file, title: cleanedTitle };
    });

    const failedFiles = [...new Set(failedTests.map((t) => t.file))];
    const packageDir = getPackageDir(failedFiles[0]);

    console.log(
      `\n${colors.green}Processing package: ${packageDir}${colors.reset}`
    );
    console.log(`Rerunning ${failedTests.length} failed tests`);

    // Escape for --grep
    const escapedTitles = failedTests
      .map((test) => test.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .filter(Boolean);
    const grepPattern = escapedTitles.join("|");

    // Config + FORCE library load (this fixes Contract error)
    const configPath = join(packageDir, ".mocharc.json");
    const configArg = existsSync(configPath) ? "--config .mocharc.json" : "";
    const setupArg = "--require @bitcoin-computer/lib";

    const mochaCommand = `${envVars} mocha ${configArg} ${setupArg} --grep "${grepPattern}" ${failedFiles.join(" ")}`;
    console.log(`Running in ${packageDir}: ${mochaCommand}`);

    execSync(mochaCommand, { cwd: packageDir, stdio: "inherit" });
  } catch (error) {
    console.error(
      `${colors.red}Error processing ${testResultsFile}: ${error.message}${colors.reset}`
    );
  }
});

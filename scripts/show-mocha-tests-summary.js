#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import glob from "glob";

// ANSI color codes for red/green output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

const cwd = process.cwd();

function getTestResultsFiles() {
  // If run from a specific package (test-results.json exists in cwd)
  if (existsSync(join(cwd, "test-results.json"))) {
    return [join(cwd, "test-results.json")];
  }

  // If run from monorepo/, collect from monorepo/packages/
  const packageDirs = glob.sync(join(cwd, "packages/*/"), { absolute: true });
  return packageDirs
    .map((dir) => join(dir, "test-results.json"))
    .filter(existsSync);
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
  console.log(`\nTest Summary for ${packageDir}:`);

  try {
    const results = JSON.parse(readFileSync(testResultsFile, "utf8"));
    const total = results.stats?.tests || 0;
    const passing = results.stats?.passes || 0;
    const failing = results.stats?.failures || 0;
    const pending = results.stats?.pending || 0;

    // Display summary
    console.log(`${colors.yellow}Total: ${total}${colors.reset}`);
    if (passing > 0) {
      console.log(`${colors.green}Passing: ${passing}${colors.reset}`);
    }
    if (failing > 0) {
      console.log(`${colors.red}Failing: ${failing}${colors.reset}`);
    }
    if (pending > 0) {
      console.log(`${colors.yellow}Pending: ${pending}${colors.reset}`);
    }
    if (total === 0) {
      console.log(`${colors.red}No tests executed${colors.reset}`);
    }

    // Display failed tests
    if (Array.isArray(results.failures) && results.failures.length > 0) {
      console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
      results.failures.forEach((failure) => {
        const title = failure.fullTitle || failure.title || "Unknown test";
        console.log(`${colors.red}- ${title}${colors.reset}`);
      });
    }
  } catch (error) {
    console.error(
      `${colors.red}Error processing ${testResultsFile}: ${error.message}${colors.reset}`
    );
  }
});

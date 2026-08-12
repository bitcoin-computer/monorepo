#!/usr/bin/env node
/**
 * Clear stale Mocha test-results.json files, then run turbo test across packages.
 * After the run, print a short summary of packages with remaining failures and
 * how to re-run only those cases via npm run test:rerun.
 *
 * Works from workspace root (packages/* + monorepo/packages/*) or monorepo root.
 */
import { existsSync, readdirSync, unlinkSync, readFileSync } from "fs";
import { join, relative } from "path";
import { execSync } from "child_process";

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

const cwd = process.cwd();

function listPackageDirs(packagesRoot) {
  if (!existsSync(packagesRoot)) return [];
  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(packagesRoot, d.name));
}

function findTestResultsFiles(root) {
  const files = [];
  const rootResults = join(root, "test-results.json");
  if (existsSync(rootResults)) {
    files.push(rootResults);
  }
  for (const packagesRoot of [
    join(root, "packages"),
    join(root, "monorepo", "packages"),
  ]) {
    for (const pkgDir of listPackageDirs(packagesRoot)) {
      const results = join(pkgDir, "test-results.json");
      if (existsSync(results)) {
        files.push(results);
      }
    }
  }
  return files;
}

function clearTestResults() {
  const files = findTestResultsFiles(cwd);
  if (files.length === 0) {
    console.log("No existing test-results.json files to clear.");
    return;
  }
  for (const file of files) {
    try {
      unlinkSync(file);
      console.log(`Cleared ${relative(cwd, file)}`);
    } catch (error) {
      console.warn(
        `${colors.yellow}Could not clear ${file}: ${error.message}${colors.reset}`
      );
    }
  }
}

function summarizeFailures() {
  const files = findTestResultsFiles(cwd);
  const summary = [];

  for (const file of files) {
    try {
      const results = JSON.parse(readFileSync(file, "utf8"));
      const count = Array.isArray(results.failures)
        ? results.failures.length
        : 0;
      if (count > 0) {
        summary.push({
          file: relative(cwd, file) || file,
          packageDir: relative(cwd, join(file, "..")) || ".",
          count,
        });
      }
    } catch {
      // ignore unreadable/partial files
    }
  }

  return summary;
}

console.log("Clearing previous test-results.json files...");
clearTestResults();
console.log("");

let turboExit = 0;
try {
  execSync("npx turbo run test --concurrency=1 --continue", {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
} catch (error) {
  turboExit = error.status ?? 1;
}

const failed = summarizeFailures();
console.log("");
console.log("--- Failed test summary (from test-results.json) ---");

if (failed.length === 0) {
  if (turboExit === 0) {
    console.log(
      `${colors.green}No Mocha failures recorded.${colors.reset}`
    );
  } else {
    console.log(
      `${colors.yellow}Turbo reported failures, but no Mocha test-results.json with failures was found.${colors.reset}`
    );
    console.log(
      "This can happen for compile/lint failures or non-Mocha packages (e.g. nakamotojs)."
    );
  }
} else {
  for (const item of failed) {
    console.log(
      `${colors.red}${item.packageDir}: ${item.count} failed test(s)${colors.reset}`
    );
  }
  console.log("");
  console.log(
    "Re-run only those failed cases with:  npm run test:rerun"
  );
}

process.exit(turboExit);

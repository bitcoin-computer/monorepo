#!/usr/bin/env node
/**
 * Re-run only failed Mocha test cases recorded in test-results.json files.
 *
 * Works after:
 *   - npm run test:turbo  (workspace or monorepo)
 *   - package-level mocha runs that use mocha-multi → json=test-results.json
 *   - package-level `npm run test:rerun` (compile + this script)
 *
 * Discovery covers:
 *   - {cwd}/test-results.json
 *   - {cwd}/packages/<pkg>/test-results.json
 *   - {cwd}/monorepo/packages/<pkg>/test-results.json  (workspace root layout)
 */
import { existsSync, readFileSync, readdirSync } from "fs";
import { join, dirname, relative, basename } from "path";
import { execFileSync, execSync } from "child_process";

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

const cwd = process.cwd();

const mochaEnv = {
  ...process.env,
  POSTGRES_HOST: "127.0.0.1",
  BITCOIN_RPC_HOST: "127.0.0.1",
  BCN_ZMQ_URL: "tcp://127.0.0.1:28332",
};

/** When set, never re-dispatch to a package's test:rerun (avoids infinite loops). */
const nested = process.env.RERUN_FAILED_NESTED === "1";

function packageLabel(packageDir) {
  const rel = relative(cwd, packageDir);
  if (rel && !rel.startsWith("..") && rel !== "") {
    return rel;
  }
  // Nested run: cwd is the package itself
  try {
    const name = JSON.parse(
      readFileSync(join(packageDir, "package.json"), "utf8"),
    ).name;
    if (name) return name;
  } catch {
    // ignore
  }
  return basename(packageDir);
}

function getPackageDir(startPath) {
  let dir =
    existsSync(startPath) && !startPath.endsWith(".json")
      ? startPath
      : dirname(startPath);
  while (dir && dir !== "/") {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return cwd;
}

function listPackageDirs(packagesRoot) {
  if (!existsSync(packagesRoot)) return [];
  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(packagesRoot, d.name));
}

function getTestResultsFiles() {
  const files = new Set();

  const rootResults = join(cwd, "test-results.json");
  if (existsSync(rootResults)) {
    files.add(rootResults);
  }

  for (const packagesRoot of [
    join(cwd, "packages"),
    join(cwd, "monorepo", "packages"),
  ]) {
    for (const pkgDir of listPackageDirs(packagesRoot)) {
      const results = join(pkgDir, "test-results.json");
      if (existsSync(results)) {
        files.add(results);
      }
    }
  }

  return [...files];
}

/**
 * Turn a Mocha fullTitle into a --grep pattern.
 * Returns { pattern, exact }:
 *   - exact=true  → match ^pattern$ (one test)
 *   - exact=false → match ^pattern  (suite / hook scope)
 */
function toGrepTarget(rawTitle) {
  if (!rawTitle) return null;

  // Prefer the suite/test path before any hook marker. That keeps shared
  // it() names (e.g. "Should return the same result...") scoped to the right
  // suite instead of matching every similar title in the file.
  const beforeHook = rawTitle.match(
    /^(.*?)\s*"(?:before|after) (?:each|all)" hook/,
  );
  if (beforeHook && beforeHook[1].trim()) {
    return { pattern: beforeHook[1].trim(), exact: false };
  }

  // Hook title with only "in Suite" (no path prefix)
  const inSuite = rawTitle.match(
    /"(?:before|after) (?:each|all)" hook(?:[^"]*) in "([^"]+)"/,
  );
  if (inSuite) {
    return { pattern: inSuite[1].trim(), exact: false };
  }

  // Normal test: use full title, exact match
  const cleaned = rawTitle.replace(/\\"/g, '"').replace(/"/g, "").trim();
  if (!cleaned) return null;
  return { pattern: cleaned, exact: true };
}

function parseFailures(testResultsFile) {
  const raw = readFileSync(testResultsFile, "utf8").trim();
  if (!raw) {
    // mocha-multi (or an interrupted run) can leave a 0-byte file
    return { failures: [], skipReason: "empty file" };
  }

  let results;
  try {
    results = JSON.parse(raw);
  } catch (error) {
    return {
      failures: [],
      skipReason: `invalid JSON (${error.message})`,
    };
  }

  if (!Array.isArray(results.failures)) {
    return {
      failures: [],
      skipReason: 'missing "failures" array',
    };
  }

  const failures = results.failures
    .filter((failure) => failure.file && (failure.fullTitle || failure.title))
    .map((failure) => {
      const rawTitle = failure.fullTitle || failure.title;
      const target = toGrepTarget(rawTitle);
      if (!target) return null;
      return {
        file: failure.file,
        pattern: target.pattern,
        exact: target.exact,
        rawTitle,
      };
    })
    .filter(Boolean);

  return { failures, skipReason: null };
}

function readPackageJson(packageDir) {
  try {
    return JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  } catch {
    return null;
  }
}

function packageHasScript(packageDir, scriptName) {
  const pkg = readPackageJson(packageDir);
  return Boolean(pkg?.scripts?.[scriptName]);
}

function resolveMocha(packageDir) {
  const candidates = [
    join(packageDir, "node_modules", ".bin", "mocha"),
    join(cwd, "node_modules", ".bin", "mocha"),
    join(cwd, "monorepo", "node_modules", ".bin", "mocha"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return "mocha";
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildGrepPattern(failedTests) {
  // Deduplicate by pattern+exact
  const seen = new Set();
  const parts = [];
  for (const t of failedTests) {
    const key = `${t.exact ? "E" : "P"}\0${t.pattern}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const escaped = escapeRegExp(t.pattern);
    // exact → one test; prefix → suite/hook scope
    parts.push(t.exact ? `^${escaped}$` : `^${escaped}`);
  }
  return parts;
}

function readResultsStats(packageDir) {
  const resultsPath = join(packageDir, "test-results.json");
  if (!existsSync(resultsPath)) return null;
  try {
    const results = JSON.parse(readFileSync(resultsPath, "utf8"));
    return {
      tests: results.stats?.tests ?? 0,
      failures: Array.isArray(results.failures) ? results.failures.length : 0,
      passes: results.stats?.passes ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Run mocha without a shell so `$` in titles (e.g. ${BCN_CHAIN}) is not expanded.
 */
function runMochaForFailures(packageDir, failedTests) {
  const failedFiles = [...new Set(failedTests.map((t) => t.file))];
  const grepParts = buildGrepPattern(failedTests);

  if (grepParts.length === 0) {
    console.log(
      `${colors.yellow}No valid failure titles to grep in ${packageLabel(packageDir)}${colors.reset}`,
    );
    return;
  }

  const grepPattern = grepParts.join("|");
  const configPath = join(packageDir, ".mocharc.json");
  const mocha = resolveMocha(packageDir);

  const args = [];
  if (existsSync(configPath)) {
    args.push("--config", ".mocharc.json");
  }
  // Also request fail-zero; mocha-multi may ignore it, so we always verify stats below.
  args.push("--fail-zero");
  args.push("--grep", grepPattern);
  args.push(...failedFiles);

  const displayPatterns = failedTests
    .map((t) => (t.exact ? t.pattern : `${t.pattern}…`))
    .filter((v, i, a) => a.indexOf(v) === i);
  const displayGrep =
    displayPatterns.join(" | ").length > 200
      ? displayPatterns.join(" | ").slice(0, 200) + "…"
      : displayPatterns.join(" | ");

  console.log(
    `Running in ${packageLabel(packageDir)}: mocha --grep (${grepParts.length} pattern(s)) ${failedFiles.length} file(s)`,
  );
  console.log(`${colors.dim}  patterns: ${displayGrep}${colors.reset}`);

  let mochaFailed = false;
  try {
    execFileSync(mocha, args, {
      cwd: packageDir,
      stdio: "inherit",
      env: mochaEnv,
    });
  } catch {
    mochaFailed = true;
  }

  // mocha-multi can exit 0 even when --grep matches nothing; trust test-results.json.
  const stats = readResultsStats(packageDir);
  const pkgLabel = packageLabel(packageDir);

  if (!stats || stats.tests === 0) {
    throw new Error(
      `Mocha matched 0 tests for ${grepParts.length} failure pattern(s). ` +
        `Titles may not match (hook cleanup / dynamic describe names).`,
    );
  }
  if (mochaFailed || stats.failures > 0) {
    throw new Error(`${stats.failures} failure(s) remaining`);
  }
}

/**
 * Group result files by package directory.
 * Root-level test-results.json (unified mocha) is keyed by cwd.
 */
function groupByPackage(testResultsFiles) {
  const groups = new Map(); // packageDir -> { failures: [...] }

  for (const testResultsFile of testResultsFiles) {
    const rel = relative(cwd, testResultsFile) || testResultsFile;
    let parsed;
    try {
      parsed = parseFailures(testResultsFile);
    } catch (error) {
      console.error(
        `${colors.red}Skipping ${rel}: ${error.message}${colors.reset}`,
      );
      continue;
    }

    if (parsed.skipReason) {
      if (!nested) {
        console.warn(
          `${colors.yellow}Skipping ${rel}: ${parsed.skipReason}.${colors.reset}`,
        );
      }
      continue;
    }

    const failedTests = parsed.failures;

    if (failedTests.length === 0) {
      if (!nested) {
        console.log(`${colors.green}No failures in ${rel}.${colors.reset}`);
      }
      continue;
    }

    // Prefer package dir from the results file location (one file per package).
    // For a root-level aggregated test-results.json, resolve via the first failure path.
    let packageDir = dirname(testResultsFile);
    if (!existsSync(join(packageDir, "package.json"))) {
      if (packageDir === cwd) {
        packageDir = getPackageDir(failedTests[0].file);
      } else {
        console.warn(
          `${colors.yellow}Skipping ${rel}: no package.json next to results file.${colors.reset}`,
        );
        continue;
      }
    }
    if (!existsSync(join(packageDir, "package.json"))) {
      console.warn(
        `${colors.yellow}Skipping ${rel}: could not resolve package directory.${colors.reset}`,
      );
      continue;
    }

    if (!groups.has(packageDir)) {
      groups.set(packageDir, { failures: [] });
    }
    groups.get(packageDir).failures.push(...failedTests);
  }

  return groups;
}

/**
 * Run the package's test:rerun script body directly (not via `npm run`) so we
 * avoid npm lifecycle error spam; still reuses package compile + this script.
 */
function runPackageTestRerun(packageDir) {
  const pkg = readPackageJson(packageDir);
  const script = pkg?.scripts?.["test:rerun"];
  if (!script) {
    throw new Error(`No test:rerun script in ${packageLabel(packageDir)}`);
  }
  console.log(`Using package script: ${script}`);
  try {
    execSync(script, {
      cwd: packageDir,
      stdio: "inherit",
      env: { ...process.env, RERUN_FAILED_NESTED: "1" },
      shell: true,
    });
  } catch {
    // Prefer remaining Mocha failures over a raw "Command failed: tsc && …" message.
    const stats = readResultsStats(packageDir);
    if (stats && stats.failures > 0) {
      throw new Error(`${stats.failures} failure(s) remaining`);
    }
    if (stats && stats.tests === 0) {
      throw new Error(
        `Mocha matched 0 tests (titles may not match after compile)`,
      );
    }
    throw new Error(`package test:rerun failed`);
  }
}

function processPackage(packageDir, failedTests) {
  const display = packageLabel(packageDir);
  const uniqueCount = new Set(failedTests.map((t) => t.pattern)).size;
  console.log(`\n${colors.green}Processing package: ${display}${colors.reset}`);
  console.log(
    `Rerunning ${failedTests.length} failed test(s)` +
      (uniqueCount !== failedTests.length
        ? ` (${uniqueCount} unique pattern(s))`
        : ""),
  );

  // When aggregating from a parent directory, prefer the package's own
  // test:rerun (recompile + this script). Nested invocation runs mocha only.
  const shouldDispatch =
    !nested && packageDir !== cwd && packageHasScript(packageDir, "test:rerun");

  if (shouldDispatch) {
    runPackageTestRerun(packageDir);
    return;
  }

  runMochaForFailures(packageDir, failedTests);
}

// --- main ---

const testResultsFiles = getTestResultsFiles();

if (testResultsFiles.length === 0) {
  console.error(
    `${colors.red}No test-results.json files found.${colors.reset}`,
  );
  console.error(
    "Run tests first (e.g. npm run test:turbo) so Mocha can write results.",
  );
  process.exit(1);
}

if (!nested) {
  console.log(
    "Found test-results files:",
    testResultsFiles.map((f) => relative(cwd, f) || f),
  );
}

const groups = groupByPackage(testResultsFiles);

if (groups.size === 0) {
  console.log(`${colors.green}No failed tests to rerun.${colors.reset}`);
  process.exit(0);
}

let failedPackages = 0;
let processedPackages = 0;
const stillFailing = [];

for (const [packageDir, { failures }] of groups) {
  processedPackages++;
  const name = packageLabel(packageDir);
  try {
    processPackage(packageDir, failures);
    if (!nested) {
      console.log(`${colors.green}✓ ${name}${colors.reset}`);
    }
  } catch (error) {
    failedPackages++;
    stillFailing.push(name);
    // Nested: exit quietly after Mocha output; the parent prints the summary.
    if (!nested) {
      console.error(`${colors.red}✗ ${name}: ${error.message}${colors.reset}`);
    }
  }
}

if (failedPackages > 0) {
  if (!nested) {
    console.log("");
    console.error(
      `${colors.red}${failedPackages}/${processedPackages} package(s) still had failures after rerun:${colors.reset}`,
    );
    for (const name of stillFailing) {
      console.error(`  - ${name}`);
    }
    console.error(
      `${colors.dim}Re-run again with: npm run test:rerun${colors.reset}`,
    );
  }
  process.exit(1);
}

if (!nested) {
  console.log("");
  console.log(
    `${colors.green}Rerun finished: ${processedPackages} package(s) with no remaining failures.${colors.reset}`,
  );
}
process.exit(0);

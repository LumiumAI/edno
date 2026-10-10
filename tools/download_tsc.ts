#!/usr/bin/env -S edno run --allow-read --allow-write --allow-env --allow-run
// Copyright 2018-2026 the Deno authors. MIT license.
// edno-lint-ignore-file no-console

// Pre-downloads the pinned native TypeScript compiler that `edno check` uses,
// into a cache directory, so CI (and local test runs) don't re-download the
// ~20MB compiler for every test's fresh `EDNO_DIR`.
//
// It warms the cache by type-checking a trivial file with the built `edno`
// binary (which downloads the compiler via its normal path), then locates the
// resulting `tsc` binary and prints its path. When run with the default cache
// directory, the test harness resolves that same path itself and injects
// `EDNO_TSC_BIN` per-test (see `test_util::native_tsc_bin_path`), so this script
// only needs to warm the cache - it does not export the path into the env.
//
//   edno run -A tools/download_tsc.ts [cache_deno_dir]
//
// For local `cargo test` runs, running it once with the default cache directory
// is enough; the harness finds the compiler under `target/.native_tsc/edno_dir`.
// To point tests at a specific binary instead, export it explicitly:
//
//   export EDNO_TSC_BIN=$(edno run -A tools/download_tsc.ts)
//
// The `edno` binary to use is taken from the `EDNO_BIN` env var, else the first
// of `./target/release/edno` or `./target/debug/edno` that exists.

const exe = Edno.build.os === "windows" ? ".exe" : "";

// Absolute paths are required because the download runs the compiler in a
// different working directory, against which relative paths would resolve.
function absolute(p: string): string {
  if (p.startsWith("/") || /^[A-Za-z]:[\\/]/.test(p)) return p;
  return `${Edno.cwd()}/${p}`;
}

function resolveDenoBin(): string {
  const fromEnv = Edno.env.get("EDNO_BIN");
  if (fromEnv) return Edno.realPathSync(fromEnv);
  for (const profile of ["release", "debug"]) {
    const candidate = `./target/${profile}/edno${exe}`;
    try {
      return Edno.realPathSync(candidate);
    } catch {
      // try the next profile
    }
  }
  throw new Error(
    "could not find a built edno binary; set EDNO_BIN or build edno first",
  );
}

function findTscBin(cacheDenoDir: string): string | undefined {
  // Layout: `<edno_dir>/tsc/<version>/<platform>/lib/tsc`.
  const tscRoot = `${cacheDenoDir}/tsc`;
  let versions: Edno.DirEntry[];
  try {
    versions = [...Edno.readDirSync(tscRoot)];
  } catch {
    return undefined;
  }
  for (const version of versions) {
    if (!version.isDirectory) continue;
    for (const platform of Edno.readDirSync(`${tscRoot}/${version.name}`)) {
      if (!platform.isDirectory) continue;
      const bin = `${tscRoot}/${version.name}/${platform.name}/lib/tsc${exe}`;
      try {
        Edno.statSync(bin);
        return bin;
      } catch {
        // keep looking
      }
    }
  }
  return undefined;
}

const cacheDenoDir = absolute(Edno.args[0] ?? "./target/.native_tsc/edno_dir");

let tscBin = findTscBin(cacheDenoDir);
if (!tscBin) {
  const ednoBin = resolveDenoBin();
  const warmDir = Edno.makeTempDirSync();
  Edno.writeTextFileSync(`${warmDir}/mod.ts`, "export {};\n");
  // Type-checking a trivial file downloads the compiler into `cacheDenoDir`.
  // The exit code is irrelevant; the compiler is fetched regardless.
  new Edno.Command(ednoBin, {
    args: ["check", "mod.ts"],
    cwd: warmDir,
    env: { EDNO_DIR: cacheDenoDir },
    stdout: "null",
    stderr: "null",
  }).outputSync();
  tscBin = findTscBin(cacheDenoDir);
}

if (!tscBin) {
  console.error("failed to download the native TypeScript compiler");
  Edno.exit(1);
}

tscBin = Edno.realPathSync(tscBin);
console.log(tscBin);

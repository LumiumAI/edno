#!/usr/bin/env -S edno run -A
// Copyright 2018-2026 the Deno authors. MIT license.

// edno-lint-ignore-file no-console

import { patchver } from "jsr:@edno/patchver@0.5.1";

const CHANNEL = Edno.args[0];
if (CHANNEL !== "rc" && CHANNEL !== "lts") {
  throw new Error(`Invalid channel: ${CHANNEL}`);
}

const BINARIES = ["edno.exe", "ednort.exe"];

async function patchBinary(inputPath: string, channel: string) {
  console.log(`Patching ${inputPath}...`);

  await Edno.rename(inputPath, `${inputPath}.bak`);
  const input = await Edno.readFile(`${inputPath}.bak`);
  const output = patchver(input, channel);

  await Edno.writeFile(inputPath, output);
  console.log(`Created ${inputPath}`);
}

async function main() {
  for (const binary of BINARIES) {
    await patchBinary(binary, CHANNEL);
  }
  console.log("All Windows binaries patched successfully!");
}

await main();

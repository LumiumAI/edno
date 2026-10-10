// Copyright 2018-2026 the Deno authors. MIT license.

const linker = Edno.args[0];
const outsidePath = linker === "isolated"
  ? "node_modules/.edno/@ednotest+invalid-bin-target@1.0.0/node_modules/@ednotest/outside.js"
  : "node_modules/@ednotest/outside.js";

async function exists(path: string) {
  try {
    await Edno.lstat(path);
    return true;
  } catch (error) {
    if (error instanceof Edno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

async function hasBinEntry(name: string) {
  for (const suffix of ["", ".cmd", ".ps1"]) {
    if (await exists(`node_modules/.bin/${name}${suffix}`)) {
      return true;
    }
  }
  return false;
}

if (!await hasBinEntry("valid-bin")) {
  throw new Error("valid bin entry was not created");
}
if (await hasBinEntry("invalid-bin")) {
  throw new Error("invalid bin entry was created");
}
if (await Edno.readTextFile(outsidePath) !== "outside marker\n") {
  throw new Error("outside file contents changed");
}
if (Edno.build.os !== "windows") {
  const mode = (await Edno.stat(outsidePath)).mode! & 0o777;
  if (mode !== 0o644) {
    throw new Error(`outside file mode changed to ${mode.toString(8)}`);
  }
}

console.log("ok");

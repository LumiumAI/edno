// Copyright 2018-2026 the Deno authors. MIT license.

// edno-lint-ignore-file no-console

import { createSymcache } from "jsr:@edno/panic@0.1.0";
import path from "node:path";

// Generate symcache for the current Edno executable.

let debugFile = Edno.execPath();

if (Edno.build.os === "windows") {
  debugFile = debugFile.replace(/\.exe$/, ".pdb");
} else if (Edno.build.os === "darwin") {
  const resolvedPath = Edno.realPathSync(`${debugFile}.dSYM`);
  const { name } = path.parse(resolvedPath);

  debugFile = path.join(resolvedPath, "Contents/Resources/DWARF", name);
}

const outfile = Edno.args[0];
if (!outfile) {
  console.error("Usage: ./target/release/edno -A create_symcache.ts <outfile>");
  Edno.exit(1);
}

const symcache = createSymcache(Edno.readFileSync(debugFile));
Edno.writeFileSync(outfile, symcache);

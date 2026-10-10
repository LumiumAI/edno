// Modify a source file in the subdirectory so it shows up as an unstaged
// change (the case `git ls-files` reports relative to the current directory).
Edno.writeTextFileSync(
  "sub/math.ts",
  Edno.readTextFileSync("sub/math.ts") + "\n// changed\n",
);

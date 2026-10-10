const binaryName = Edno.build.os === "windows" ? "binary.exe" : "binary";
Edno.copyFileSync(Edno.execPath(), binaryName);

console.log("Running...");
new Edno.Command(
  Edno.execPath(),
  {
    args: [
      "run",
      "--allow-write",
      "--allow-read",
      `--allow-run=binary`,
      "sub.ts",
    ],
    env: {
      PATH: Edno.cwd(),
    },
    stderr: "inherit",
    stdout: "inherit",
  },
).outputSync();

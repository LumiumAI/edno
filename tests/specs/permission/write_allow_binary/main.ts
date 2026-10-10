const binaryName = Edno.build.os === "windows" ? "binary.exe" : "binary";
Edno.copyFileSync(Edno.execPath(), binaryName);

console.log("Running...");
const result = new Edno.Command(
  Edno.execPath(),
  {
    args: ["run", "--allow-write", `--allow-run=./${binaryName}`, "sub.ts"],
    stderr: "inherit",
    stdout: "inherit",
  },
).outputSync();

console.assert(result.code == 1, "Expected failure");

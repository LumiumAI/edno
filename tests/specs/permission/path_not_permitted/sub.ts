const binaryName = Edno.build.os === "windows" ? "binary.exe" : "binary";
const pathSep = Edno.build.os === "windows" ? "\\" : "/";

Edno.mkdirSync("subdir");
Edno.copyFileSync(binaryName, "subdir/" + binaryName);

try {
  const commandResult = new Edno.Command(
    "binary",
    {
      env: { "PATH": Edno.cwd() + pathSep + "subdir" },
      stdout: "inherit",
      stderr: "inherit",
    },
  ).outputSync();

  console.log(commandResult.code);
} catch (err) {
  console.log(err);
}

try {
  const child = Edno.run(
    {
      cmd: ["binary"],
      env: { "PATH": Edno.cwd() + pathSep + "subdir" },
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  console.log((await child.status()).code);
} catch (err) {
  console.log(err);
}

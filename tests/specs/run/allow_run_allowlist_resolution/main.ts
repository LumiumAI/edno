// Testing the following:
// | `edno run --allow-run=binary`         | `which path == "/usr/bin/binary"` at startup | `which path != "/usr/bin/binary"` at startup |
// |---------------------------------------|----------------------------------------------|--------------------------------------------|
// | **`Edno.Command("binary")`**          | :white_check_mark:                                          | :white_check_mark:                                         |
// | **`Edno.Command("/usr/bin/binary")`** | :white_check_mark:                                          | :x:                                         |
// | `edno run --allow-run=/usr/bin/binary | `which path == "/usr/bin/binary"` at runtime | `which path != "/usr/bin/binary"` at runtime |
// |---------------------------------------|----------------------------------------------|--------------------------------------------|
// | **`Edno.Command("binary")`**          | :white_check_mark:                                          | :x:                                         |
// | **`Edno.Command("/usr/bin/binary")`** | :white_check_mark:                                          | :white_check_mark:                                         |

const binaryName = Edno.build.os === "windows" ? "binary.exe" : "binary";
const pathSep = Edno.build.os === "windows" ? "\\" : "/";
const cwd = Edno.cwd();
const execPathParent = `${Edno.cwd()}${pathSep}sub`;
const execPath = `${execPathParent}${pathSep}${binaryName}`;

Edno.mkdirSync(execPathParent);
Edno.copyFileSync(Edno.execPath(), execPath);

const testUrl = `data:application/typescript;base64,${
  btoa(`
  console.error(await Edno.permissions.query({ name: "run", command: "binary" }));
  console.error(await Edno.permissions.query({ name: "run", command: "${
    execPath.replaceAll("\\", "\\\\")
  }" }));
  Edno.env.set("PATH", "");
  console.error(await Edno.permissions.query({ name: "run", command: "binary" }));
  console.error(await Edno.permissions.query({ name: "run", command: "${
    execPath.replaceAll("\\", "\\\\")
  }" }));
`)
}`;

await new Edno.Command(Edno.execPath(), {
  args: [
    "run",
    "--allow-env",
    "--allow-run=binary",
    testUrl,
  ],
  stdout: "inherit",
  stderr: "inherit",
  env: { "PATH": execPathParent },
}).output();

console.error("---");

await new Edno.Command(Edno.execPath(), {
  args: [
    "run",
    "--allow-env",
    "--allow-run=binary",
    testUrl,
  ],
  stderr: "inherit",
  stdout: "inherit",
  env: { "PATH": "" },
}).output();

console.error("---");

await new Edno.Command(Edno.execPath(), {
  args: [
    "run",
    "--allow-env",
    `--allow-run=${execPath}`,
    testUrl,
  ],
  stderr: "inherit",
  stdout: "inherit",
  env: { "PATH": execPathParent },
}).output();

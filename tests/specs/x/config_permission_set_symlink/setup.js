// The real config lives in a sibling `real/` dir and cwd `config.json` is a
// SYMLINK to it. The permission set grants write to `.` (relative to the config
// file's directory).
Edno.mkdirSync("real");
Edno.writeTextFileSync(
  "real/edno.json",
  JSON.stringify({ permissions: { write: { write: ["."] } } }),
);
// Store the target with the platform separator so it resolves on Windows too.
const sep = Edno.build.os === "windows" ? "\\" : "/";
Edno.symlinkSync(`real${sep}edno.json`, "config.json");

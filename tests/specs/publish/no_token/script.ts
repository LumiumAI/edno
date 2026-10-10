const output = new Edno.Command(Edno.execPath(), {
  args: ["publish"],
  clearEnv: true,
  env: {
    "GITHUB_ACTIONS": "true",
  },
  stdout: "inherit",
  stderr: "inherit",
}).outputSync();
Edno.exit(output.code);

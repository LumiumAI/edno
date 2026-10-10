// Sets up a git repo in the current directory with:
// 1. Initial commit with workspace + two packages at v1.0.0
// 2. Tag "v1.0.0" on that commit
// 3. A manual version change (a/edno.json bumped to 1.2.0)
// 4. A conventional commit "fix(b): patch fix"
// This lets us test that `edno bump-version` detects the manual change for @x/a
// and derives a commit-based bump for @x/b.

const run = async (cmd: string[]) => {
  const c = new Edno.Command(cmd[0], {
    args: cmd.slice(1),
    stdout: "inherit",
    stderr: "inherit",
  });
  const { success } = await c.output();
  if (!success) throw new Error(`Command failed: ${cmd.join(" ")}`);
};

await run(["git", "init"]);
await run(["git", "config", "user.email", "test@test.com"]);
await run(["git", "config", "user.name", "Test"]);

// Initial commit with all files.
await run(["git", "add", "."]);
await run(["git", "commit", "-m", "initial"]);
await run(["git", "tag", "v1.0.0"]);

// Manually bump a/edno.json from 1.0.0 to 1.2.0.
const aConfig = JSON.parse(Edno.readTextFileSync("a/edno.json"));
aConfig.version = "1.2.0";
Edno.writeTextFileSync("a/edno.json", JSON.stringify(aConfig, null, 2) + "\n");

await run(["git", "add", "a/edno.json"]);
await run(["git", "commit", "-m", "fix(b): patch fix"]);

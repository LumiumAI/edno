// `edno remove --global` is an alias for `edno uninstall --global`, so after
// it runs the globally installed executable should be gone from the bin dir.
const binsDir = "./bins/bin";
for await (const entry of Edno.readDir(binsDir)) {
  if (entry.name === "edno-test-bin" || entry.name === "edno-test-bin.cmd") {
    throw new Error(
      `Expected ${entry.name} to be removed by 'edno remove --global', but it still exists`,
    );
  }
}

await new Edno.Command(Edno.execPath(), {
  args: ["eval", "--quiet", "console.log('Hello, world! 1')"],
  stdout: "inherit",
}).output();
new Edno.Command(Edno.execPath(), {
  args: ["eval", "--quiet", "console.log('Hello, world! 2')"],
  stdout: "inherit",
}).outputSync();

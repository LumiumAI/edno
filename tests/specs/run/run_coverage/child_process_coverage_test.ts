Edno.test("foo 1 0", () => runDenoCommand("run foo.ts 1 0"));
Edno.test("foo 0 1", () => runDenoCommand("run foo.ts 0 1"));

async function runDenoCommand(args: string) {
  await new Edno.Command(Edno.execPath(), { args: args.split(" ") }).output();
}

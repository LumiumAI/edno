import { complex } from "./complex.ts";

Edno.test("complex", function () {
  complex("foo", "bar", "baz");
});

Edno.test("sub process with stdin", async () => {
  // ensure launching edno run with stdin doesn't affect coverage
  const code = "console.log('5')";
  const command = new Edno.Command(Edno.execPath(), {
    args: ["run", "-"],
    stdin: "piped",
    stdout: "piped",
  });
  await using child = command.spawn();
  await ReadableStream.from([code])
    .pipeThrough(new TextEncoderStream())
    .pipeTo(child.stdin);
  const { stdout } = await child.output();
  const output = new TextDecoder().decode(stdout);
  if (output.trim() !== "5") {
    throw new Error("Failed");
  }
});

Edno.test("sub process with edno eval", () => {
  // ensure launching edno eval doesn't affect coverage
  const code = "console.log('5')";
  const { stdout } = new Edno.Command(Edno.execPath(), {
    args: ["eval", code],
  }).outputSync();
  const output = new TextDecoder().decode(stdout);
  if (output.trim() !== "5") {
    throw new Error("Failed");
  }
});

Edno.test("EDNO_COVERAGE_DIR is set and passed down to child process", () => {
  const coverageDir = Edno.env.get("EDNO_COVERAGE_DIR");
  if (coverageDir === undefined) {
    throw new Error("EDNO_COVERAGE_DIR is not set");
  }
  const code = "console.log(Edno.env.get('EDNO_COVERAGE_DIR'))";
  const { stdout } = new Edno.Command(Edno.execPath(), {
    args: ["eval", code],
  }).outputSync();
  const output = new TextDecoder().decode(stdout);
  if (output.trim() !== coverageDir) {
    throw new Error("Failed");
  }
});

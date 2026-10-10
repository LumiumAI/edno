// This test is Linux/Darwin only
if (Edno.build.os !== "linux" && Edno.build.os !== "darwin") {
  console.log("hi\n\n0");
  Edno.exit(123);
}

const cmd = new Edno.Command("/usr/bin/env", {
  args: [
    "bash",
    "-c",
    [Edno.execPath(), "run", "--allow-read", "reader.ts", '<(echo "hi")'].join(
      " ",
    ),
  ],
}).spawn();

console.log((await cmd.status).code);
Edno.exit(123);

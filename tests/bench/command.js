// Copyright 2018-2026 the Deno authors. MIT license.

Edno.bench("echo edno", async () => {
  await new Edno.Command("echo", { args: ["edno"] }).output();
});

Edno.bench("cat 128kb", async () => {
  await new Edno.Command("cat", {
    args: ["./tests/bench/testdata/128k.bin"],
  }).output();
});

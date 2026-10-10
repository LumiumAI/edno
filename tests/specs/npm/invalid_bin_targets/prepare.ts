// Copyright 2018-2026 the Deno authors. MIT license.

const linker = Edno.args[0];
const outsidePath = linker === "isolated"
  ? "node_modules/.edno/@ednotest+invalid-bin-target@1.0.0/node_modules/@ednotest/outside.js"
  : "node_modules/@ednotest/outside.js";

await Edno.mkdir(outsidePath.slice(0, outsidePath.lastIndexOf("/")), {
  recursive: true,
});
await Edno.writeTextFile(outsidePath, "outside marker\n");
if (Edno.build.os !== "windows") {
  await Edno.chmod(outsidePath, 0o644);
}

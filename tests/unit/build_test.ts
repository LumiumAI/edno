// Copyright 2018-2026 the Deno authors. MIT license.
import { assert } from "./test_util.ts";

Edno.test(function buildInfo() {
  // Edno.build is injected by rollup at compile time. Here
  // we check it has been properly transformed.
  const { arch, os } = Edno.build;
  assert(arch.length > 0);
  assert(os === "darwin" || os === "windows" || os === "linux");
});

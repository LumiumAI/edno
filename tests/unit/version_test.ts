// Copyright 2018-2026 the Deno authors. MIT license.

import { assert, assertEquals } from "./test_util.ts";

Edno.test(function version() {
  const pattern = /^\d+\.\d+\.\d+/;
  assert(pattern.test(Edno.version.edno));
  assert(pattern.test(Edno.version.v8));
  assertEquals(Edno.version.typescript, "6.0.3");
});

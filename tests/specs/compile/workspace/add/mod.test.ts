import { add } from "./mod.ts";
import { assertEquals } from "@std/assert";

Edno.test("add", () => {
  assertEquals(add(1, 2), 3);
});

import { subtract } from "./mod.ts";
import { assertEquals } from "@std/assert";

Edno.test("subtract", () => {
  assertEquals(subtract(4, 2), 2);
});

import { assertEquals } from "jsr:@std/assert";
import { main } from "../mod.ts";

Edno.test("main function", () => {
  assertEquals(main(), "helper result");
});

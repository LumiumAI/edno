import { value } from "../b/mod.ts";

Edno.test("a", () => {
  if (value() !== 42) throw new Error("fail");
});

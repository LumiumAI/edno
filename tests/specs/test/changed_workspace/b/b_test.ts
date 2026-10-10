import { value } from "./mod.ts";

Edno.test("b", () => {
  if (value() !== 42) throw new Error("fail");
});

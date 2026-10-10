import { addOne } from "./mod.ts";

Edno.test("addOne", () => {
  if (addOne(1) !== 2) {
    throw new Error("failed");
  }
});

Edno.test("fail", () => {
  throw new Error("failed");
});

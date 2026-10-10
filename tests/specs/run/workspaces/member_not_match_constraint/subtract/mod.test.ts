import { subtract } from "./mod.ts";

Edno.test("subtract", () => {
  if (subtract(3, 2) !== 1) {
    throw new Error("fail");
  }
});

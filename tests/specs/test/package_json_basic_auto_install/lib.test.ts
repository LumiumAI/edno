import { add } from "./lib.ts";

Edno.test("should add", () => {
  if (add(1, 2) !== 3) {
    throw new Error("Fail");
  }
});

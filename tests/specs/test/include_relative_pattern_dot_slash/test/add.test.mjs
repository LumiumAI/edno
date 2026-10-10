import { add } from "./add.mjs";

Edno.test("should add", () => {
  if (add(1, 2) !== 3) {
    throw new Error("FAIL");
  }
});

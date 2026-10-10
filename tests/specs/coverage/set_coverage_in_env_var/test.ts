import { add } from "./source.ts";

Edno.test("add()", () => {
  if (add(1, 2) !== 3) {
    throw new Error("test failed");
  }
});

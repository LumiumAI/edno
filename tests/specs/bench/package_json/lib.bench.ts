import { add } from "./lib.ts";

Edno.bench("should add", () => {
  if (add(1, 2) !== 3) {
    throw new Error("Fail");
  }
});

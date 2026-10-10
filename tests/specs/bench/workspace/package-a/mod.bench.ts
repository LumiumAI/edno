import { add } from "./mod.ts";

Edno.bench("add", () => {
  if (add(1, 2) !== 3) {
    throw new Error("failed");
  }
});

import { addOne } from "./mod.ts";

Edno.bench("addOne", () => {
  if (addOne(1) !== 2) {
    throw new Error("failed");
  }
});

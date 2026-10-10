import { add } from "./math.ts";

Edno.test("add", () => {
  if (add(1, 2) !== 3) throw new Error("fail");
});

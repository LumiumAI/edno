import { guarded } from "./mod.js";

Edno.test("takes the consequent, never the alternative", () => {
  guarded(1);
});

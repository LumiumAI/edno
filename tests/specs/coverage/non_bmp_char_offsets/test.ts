import { guarded, second } from "./mod.ts";

Edno.test("calls the second function and the guard, never the first", () => {
  second(1);
  guarded({});
});

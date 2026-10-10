import { a } from "./source.ts";
import { b } from "./source.ts#fragment";
import { c } from "./source.ts?search";

Edno.test("a", () => {
  a();
});

Edno.test("b", () => {
  b();
});

Edno.test("c", () => {
  c();
});

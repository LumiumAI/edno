import { foo } from "./foo.ts";
import { bar } from "./bar.ts";
import { qux } from "./baz/qux.ts";
import { quux } from "./baz/quux.ts";

Edno.test("foo", () => {
  foo(true);
  foo(false);
});

Edno.test("bar", () => {
  bar(false);
});

Edno.test("qux", () => {
  qux(true);
  qux(false);
});

Edno.test("quux", () => {
  quux(false);
});

// Function constructor or eval function generates a new script source internally.
// This call ensures that the coverage data for the eval script source is not generated.
eval("console.log(1)");

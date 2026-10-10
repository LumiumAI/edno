import { assertStrictEquals, TestInterface } from "./index.ts";

Edno.test(function noTranspiledLines() {
  const foo: TestInterface = { id: "id" };

  assertStrictEquals(foo.id, "id");
});

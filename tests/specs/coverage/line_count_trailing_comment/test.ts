import { noComment, withComment } from "./mod.ts";

Edno.test("guards", () => {
  noComment({});
  withComment({});
});

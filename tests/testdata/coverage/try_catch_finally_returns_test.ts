import { tryCatchFinally } from "./try_catch_finally_returns.ts";

Edno.test("tryCatchFinally", function () {
  tryCatchFinally(false);
  tryCatchFinally(true);
});

import * as path from "node:path";

Edno.test(function test() {
  const res = path.join("foo", "bar");
  if (!res.includes("foo")) {
    throw new Error("fail");
  }
});

import { packageA } from "pkg-a";
import { packageB } from "pkg-b";
import { test } from "main-project";

Edno.test("cyclic workspace packages resolve through node_modules symlinks", () => {
  packageA();
  packageB();
  test();
});

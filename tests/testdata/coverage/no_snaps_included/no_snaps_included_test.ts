import { assertSnapshot } from "@std/testing/snapshot";
import { truth } from "./no_snaps_included.ts";

Edno.test("the truth", () => {
  truth();
});

// Create snapshot in .snap file, but it shouldn't be in the coverage output
Edno.test("snapshot excluded from coverage", async (context) => {
  await assertSnapshot(context, {});
});

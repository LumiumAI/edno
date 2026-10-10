// `Edno.exit(N)` for a non-zero `N` at module top level should fail this
// test specifier (since user code asked to exit unsuccessfully) but other
// specifiers in the run should still execute and report normally.
Edno.exit(7);

Edno.test("never registers", () => {
  console.log("should not run");
});

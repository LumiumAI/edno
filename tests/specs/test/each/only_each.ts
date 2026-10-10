// `Edno.test.only.each` registers one focused test per case; every other test
// in the file is filtered out and the run fails because "only" was used.
Edno.test.only.each([
  ["a"],
  ["b"],
])("focused %s", (s) => {
  if (typeof s !== "string") throw new Error("unexpected case value");
});

Edno.test("not focused", () => {
  throw new Error("non-only test should be filtered out");
});

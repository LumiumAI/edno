Edno.test("bar 1", () => {});

Edno.test("bar 2", () => {
  throw new Error("bar 2");
});
Edno.test("bar 3", () => {
  throw new Error("bar 3 message");
});

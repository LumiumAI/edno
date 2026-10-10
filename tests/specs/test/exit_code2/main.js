Edno.test("Edno.exitCode", () => {
  Edno.exitCode = 5;
  throw new Error("");
});

Edno.test("success", () => {
});

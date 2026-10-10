// Test file to verify error handling in afterAll hooks

Edno.test.afterAll(() => {
  console.log("afterAll 2 executed");
});

Edno.test.afterAll(() => {
  console.log("afterAll 1 executed");
  throw new Error("afterAll 1 failed");
});

Edno.test("first test", () => {
  console.log("test executed");
});

Edno.test("foo 1", () => {
  throw new Error("foo 1 message");
});

Edno.test("foo 2", () => {});

Edno.test("foo 3", () => {
  Promise.reject(new Error("foo 3 message"));
});

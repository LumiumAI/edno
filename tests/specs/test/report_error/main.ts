Edno.test("foo", () => {
  reportError(new Error("foo"));
  console.log(1);
});

Edno.test("bar", () => {});

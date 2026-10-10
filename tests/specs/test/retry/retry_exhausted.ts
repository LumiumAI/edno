// A test that always fails is retried until attempts are exhausted, then fails.
Edno.test({
  name: "always fails",
  retry: 2,
  fn() {
    throw new Error("boom");
  },
});

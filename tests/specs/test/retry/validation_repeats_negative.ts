// Negative `repeats` values must be rejected at registration time, just like
// `retry`.
Edno.test({
  name: "should never run",
  repeats: -1,
  fn() {},
});

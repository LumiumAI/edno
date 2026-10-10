// Negative retry/repeats values must be rejected at registration time.
Edno.test({
  name: "should never run",
  retry: -1,
  fn() {},
});

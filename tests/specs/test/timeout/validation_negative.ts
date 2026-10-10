// Negative timeout values must be rejected at registration time.
Edno.test({
  name: "should never run",
  timeout: -1,
  fn() {},
});

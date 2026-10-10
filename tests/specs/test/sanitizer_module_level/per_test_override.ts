// Enable ops sanitizer at module level
Edno.test.sanitizer({ ops: true });

// This test overrides the module-level sanitizer, so the timer leak is allowed
Edno.test({
  name: "timer leak allowed by per-test override",
  sanitizeOps: false,
  fn() {
    setTimeout(() => {}, 10000);
  },
});

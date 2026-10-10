// Verify the ignorelist for sanitizer-ignoring tests does NOT suppress genuine
// timer, resource and async op leaks introduced by a later, sanitized test.

Edno.test(
  { sanitizeOps: false, sanitizeResources: false },
  function ignoresSanitizersAndLeaksActivities() {
    const listener = Edno.listen({ hostname: "127.0.0.1", port: 0 });
    listener.accept().catch(() => {});
    const timer = setTimeout(() => {}, 100000);
    Edno.unrefTimer(timer);
  },
);

Edno.test(function laterTestLeaksItsOwnActivities() {
  const listener = Edno.listen({ hostname: "127.0.0.1", port: 0 });
  listener.accept().catch(() => {});
  const timer = setTimeout(() => {}, 100000);
  Edno.unrefTimer(timer);
});

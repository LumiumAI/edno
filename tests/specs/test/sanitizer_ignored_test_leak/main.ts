// A test that ignores sanitizers is allowed to leak ops, resources and timers.
// Those leaks must not be attributed to subsequent tests.

let leakedTimerId: ReturnType<typeof setTimeout>;
let leakedListener: Edno.Listener;
let leakedAccept: Promise<void>;

Edno.test(
  { sanitizeOps: false, sanitizeResources: false },
  function ignoresSanitizersAndLeaksActivities() {
    // Intentionally leak a timer, a resource, and a pending async op. This test
    // opts out of sanitizers, so it does not fail.
    leakedTimerId = setTimeout(() => {}, 100000);
    leakedListener = Edno.listen({ hostname: "127.0.0.1", port: 0 });
    leakedAccept = leakedListener.accept().then(
      (conn) => conn.close(),
      () => {},
    );
  },
);

Edno.test(async function laterTestClearsTheLeakedActivities() {
  // Clearing/closing activities leaked by the previous (sanitizer-ignoring)
  // test makes them complete during this test. Before the ignorelist fix, this
  // was reported as sanitizer activity attributed to this test. It must not be
  // reported here because the leaks came from a test that opted out of
  // sanitizers.
  clearTimeout(leakedTimerId);
  leakedListener.close();
  await leakedAccept;
});

Edno.test(async function laterTestIsUnaffected() {
  // A normal test that does not leak should still pass.
  await new Promise((resolve) => setTimeout(resolve, 1));
});

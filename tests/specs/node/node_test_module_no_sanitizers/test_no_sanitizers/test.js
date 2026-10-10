import test from "node:test";
test("should not complain about resource and op sanitizers", async (t) => {
  // resource
  const _file1 = Edno.open("test_no_sanitizers/welcome.ts");

  await t.test("nested test", () => {
    // resource
    const _file2 = Edno.open("test_no_sanitizers/cat.ts");

    // op
    crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode("a".repeat(1_000_000)),
    );
  });

  // op
  crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode("a".repeat(1_000_000)),
  );
});

test("should allow exit", () => {
  // No exit sanitizers, but exiting now reliably flushes output and aborts the
  // test run with a message instead of silently terminating the process.
  Edno.exit(123);
});

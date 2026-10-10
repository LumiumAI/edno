// Calling Edno.test.sanitizer() with invalid options must throw TypeError
// rather than crash with "Cannot read properties of undefined".

function assertThrowsTypeError(fn: () => void, label: string) {
  try {
    fn();
  } catch (e) {
    if (!(e instanceof TypeError)) {
      throw new Error(
        `${label}: expected TypeError, got ${e?.constructor?.name}: ${
          (e as Error).message
        }`,
      );
    }
    return;
  }
  throw new Error(`${label}: expected TypeError, but no error was thrown`);
}

Edno.test("sanitizer() rejects non-object arguments", () => {
  // edno-lint-ignore no-explicit-any
  const sanitizer = (Edno.test as any).sanitizer;
  assertThrowsTypeError(() => sanitizer(), "no arguments");
  assertThrowsTypeError(() => sanitizer(null), "null");
  assertThrowsTypeError(() => sanitizer(undefined), "undefined");
  assertThrowsTypeError(() => sanitizer("ops"), "string");
  assertThrowsTypeError(() => sanitizer(42), "number");
});

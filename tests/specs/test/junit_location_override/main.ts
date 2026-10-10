// Simulates what a BDD library (e.g. @std/testing/bdd) does when it wraps
// user tests: it calls Edno.test() internally but sets
// Symbol.for("Edno.test.location") on the test function so the runner uses
// the user's source location instead of the library's own file.

// edno-lint-ignore no-explicit-any
const libraryRegisteredFn: any = () => {};
libraryRegisteredFn[Symbol.for("Edno.test.location")] =
  "https://jsr.io/@std/testing/1.0.0/bdd.ts:100:10";
Edno.test("library registered test", libraryRegisteredFn);

// Ordinary test without a location override — location is this file.
Edno.test("normal test", () => {});

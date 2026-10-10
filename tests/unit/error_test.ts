// Copyright 2018-2026 the Deno authors. MIT license.
import {
  assertEquals,
  assertInstanceOf,
  assertThrows,
  fail,
} from "@std/assert";

const errorConstructors = [
  Edno.errors.NotFound,
  Edno.errors.PermissionDenied,
  Edno.errors.ConnectionRefused,
  Edno.errors.ConnectionReset,
  Edno.errors.ConnectionAborted,
  Edno.errors.NotConnected,
  Edno.errors.AddrInUse,
  Edno.errors.AddrNotAvailable,
  Edno.errors.BrokenPipe,
  Edno.errors.AlreadyExists,
  Edno.errors.InvalidData,
  Edno.errors.TimedOut,
  Edno.errors.Interrupted,
  Edno.errors.WriteZero,
  Edno.errors.WouldBlock,
  Edno.errors.UnexpectedEof,
  Edno.errors.BadResource,
  Edno.errors.Http,
  Edno.errors.Busy,
  Edno.errors.NotSupported,
  Edno.errors.FilesystemLoop,
  Edno.errors.IsADirectory,
  Edno.errors.NetworkUnreachable,
  Edno.errors.NotADirectory,
  Edno.errors.NotCapable,
];

function assertError(ErrorConstructor: typeof Edno.errors.NotFound) {
  const error = new ErrorConstructor("msg", { cause: "cause" });
  assertInstanceOf(error, Error);
  assertEquals(error.cause, "cause");
}

Edno.test("Errors work", () => {
  for (const errorConstructor of errorConstructors) {
    assertError(errorConstructor);
  }
});

Edno.test("Errors have some tamper resistance", () => {
  // edno-lint-ignore no-explicit-any
  (Object.prototype as any).get = () => {};
  assertThrows(() => fail("test error"), Error, "test error");
  // edno-lint-ignore no-explicit-any
  delete (Object.prototype as any).get;
});

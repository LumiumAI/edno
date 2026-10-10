// Copyright 2018-2026 the Deno authors. MIT license.
import { assertEquals } from "./test_util.ts";

Edno.test(async function stdioStdinRead() {
  const nread = await Edno.stdin.read(new Uint8Array(0));
  assertEquals(nread, 0);
});

Edno.test(function stdioStdinReadSync() {
  const nread = Edno.stdin.readSync(new Uint8Array(0));
  assertEquals(nread, 0);
});

Edno.test(async function stdioStdoutWrite() {
  const nwritten = await Edno.stdout.write(new Uint8Array(0));
  assertEquals(nwritten, 0);
});

Edno.test(function stdioStdoutWriteSync() {
  const nwritten = Edno.stdout.writeSync(new Uint8Array(0));
  assertEquals(nwritten, 0);
});

Edno.test(async function stdioStderrWrite() {
  const nwritten = await Edno.stderr.write(new Uint8Array(0));
  assertEquals(nwritten, 0);
});

Edno.test(function stdioStderrWriteSync() {
  const nwritten = Edno.stderr.writeSync(new Uint8Array(0));
  assertEquals(nwritten, 0);
});

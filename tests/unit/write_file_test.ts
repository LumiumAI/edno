// Copyright 2018-2026 the Deno authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  unreachable,
} from "./test_util.ts";

Edno.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncSuccess() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    Edno.writeFileSync(filename, data);
    const dataRead = Edno.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncUrl() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Edno.makeTempDirSync();
    const fileUrl = new URL(
      `file://${Edno.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    Edno.writeFileSync(fileUrl, data);
    const dataRead = Edno.readFileSync(fileUrl);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");

    Edno.removeSync(tempDir, { recursive: true });
  },
);

Edno.test({ permissions: { write: true } }, function writeFileSyncFail() {
  const enc = new TextEncoder();
  const data = enc.encode("Hello");
  const filename = "/baddir/test.txt";
  // The following should fail because /baddir doesn't exist (hopefully).
  assertThrows(() => {
    Edno.writeFileSync(filename, data);
  }, Edno.errors.NotFound);
});

Edno.test({ permissions: { write: false } }, function writeFileSyncPerm() {
  const enc = new TextEncoder();
  const data = enc.encode("Hello");
  const filename = "/baddir/test.txt";
  // The following should fail due to no write permission
  assertThrows(() => {
    Edno.writeFileSync(filename, data);
  }, Edno.errors.NotCapable);
});

Edno.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncUpdateMode() {
    if (Edno.build.os !== "windows") {
      const enc = new TextEncoder();
      const data = enc.encode("Hello");
      const filename = Edno.makeTempDirSync() + "/test.txt";
      Edno.writeFileSync(filename, data, { mode: 0o755 });
      assertEquals(Edno.statSync(filename).mode! & 0o777, 0o755);
      Edno.writeFileSync(filename, data, { mode: 0o666 });
      assertEquals(Edno.statSync(filename).mode! & 0o777, 0o666);
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncCreate() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    // if create turned off, the file won't be created
    assertThrows(() => {
      Edno.writeFileSync(filename, data, { create: false });
    }, Edno.errors.NotFound);

    // Turn on create, should have no error
    Edno.writeFileSync(filename, data, { create: true });
    Edno.writeFileSync(filename, data, { create: false });
    const dataRead = Edno.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncCreateNew() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    Edno.writeFileSync(filename, data, { createNew: true });

    assertThrows(() => {
      Edno.writeFileSync(filename, data, { createNew: true });
    }, Edno.errors.AlreadyExists);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function writeFileSyncAppend() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    Edno.writeFileSync(filename, data);
    Edno.writeFileSync(filename, data, { append: true });
    let dataRead = Edno.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    let actual = dec.decode(dataRead);
    assertEquals(actual, "HelloHello");
    // Now attempt overwrite
    Edno.writeFileSync(filename, data, { append: false });
    dataRead = Edno.readFileSync(filename);
    actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
    // append not set should also overwrite
    Edno.writeFileSync(filename, data);
    dataRead = Edno.readFileSync(filename);
    actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileSuccess() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    await Edno.writeFile(filename, data);
    const dataRead = Edno.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileUrl() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = await Edno.makeTempDir();
    const fileUrl = new URL(
      `file://${Edno.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    await Edno.writeFile(fileUrl, data);
    const dataRead = Edno.readFileSync(fileUrl);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");

    Edno.removeSync(tempDir, { recursive: true });
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileNotFound() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = "/baddir/test.txt";
    // The following should fail because /baddir doesn't exist (hopefully).
    await assertRejects(async () => {
      await Edno.writeFile(filename, data);
    }, Edno.errors.NotFound);
  },
);

Edno.test(
  { permissions: { read: true, write: false } },
  async function writeFilePerm() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = "/baddir/test.txt";
    // The following should fail due to no write permission
    await assertRejects(async () => {
      await Edno.writeFile(filename, data);
    }, Edno.errors.NotCapable);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileUpdateMode() {
    if (Edno.build.os !== "windows") {
      const enc = new TextEncoder();
      const data = enc.encode("Hello");
      const filename = Edno.makeTempDirSync() + "/test.txt";
      await Edno.writeFile(filename, data, { mode: 0o755 });
      assertEquals(Edno.statSync(filename).mode! & 0o777, 0o755);
      await Edno.writeFile(filename, data, { mode: 0o666 });
      assertEquals(Edno.statSync(filename).mode! & 0o777, 0o666);
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileCreate() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    // if create turned off, the file won't be created
    await assertRejects(async () => {
      await Edno.writeFile(filename, data, { create: false });
    }, Edno.errors.NotFound);

    // Turn on create, should have no error
    await Edno.writeFile(filename, data, { create: true });
    await Edno.writeFile(filename, data, { create: false });
    const dataRead = Edno.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileCreateNew() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    await Edno.writeFile(filename, data, { createNew: true });
    await assertRejects(async () => {
      await Edno.writeFile(filename, data, { createNew: true });
    }, Edno.errors.AlreadyExists);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileAppend() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    await Edno.writeFile(filename, data);
    await Edno.writeFile(filename, data, { append: true });
    let dataRead = Edno.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    let actual = dec.decode(dataRead);
    assertEquals(actual, "HelloHello");
    // Now attempt overwrite
    await Edno.writeFile(filename, data, { append: false });
    dataRead = Edno.readFileSync(filename);
    actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
    // append not set should also overwrite
    await Edno.writeFile(filename, data);
    dataRead = Edno.readFileSync(filename);
    actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignal(): Promise<void> {
    const ac = new AbortController();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    queueMicrotask(() => ac.abort());
    try {
      await Edno.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(e.name, "AbortError");
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalReason(): Promise<void> {
    const ac = new AbortController();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    const abortReason = new Error();
    queueMicrotask(() => ac.abort(abortReason));
    try {
      await Edno.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assertEquals(e, abortReason);
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalPrimitiveReason(): Promise<void> {
    const ac = new AbortController();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    queueMicrotask(() => ac.abort("Some string"));
    try {
      await Edno.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assertEquals(e, "Some string");
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalPreAborted(): Promise<void> {
    const ac = new AbortController();
    ac.abort();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    try {
      await Edno.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assert(e instanceof Error);
      assertEquals(e.name, "AbortError");
    }
    assertNotExists(filename);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalReasonPreAborted(): Promise<void> {
    const ac = new AbortController();
    const abortReason = new Error();
    ac.abort(abortReason);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    try {
      await Edno.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assertEquals(e, abortReason);
    }
    assertNotExists(filename);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileAbortSignalPrimitiveReasonPreAborted(): Promise<
    void
  > {
    const ac = new AbortController();
    ac.abort("Some string");
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    try {
      await Edno.writeFile(filename, data, { signal: ac.signal });
      unreachable();
    } catch (e) {
      assertEquals(e, "Some string");
    }
    assertNotExists(filename);
  },
);

// Test that AbortController's cancel handle is cleaned-up correctly, and do not leak resources.
Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileWithAbortSignalNotCalled() {
    const ac = new AbortController();
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const filename = Edno.makeTempDirSync() + "/test.txt";
    await Edno.writeFile(filename, data, { signal: ac.signal });
    const dataRead = Edno.readFileSync(filename);
    const dec = new TextDecoder("utf-8");
    const actual = dec.decode(dataRead);
    assertEquals(actual, "Hello");
  },
);

function assertNotExists(filename: string | URL) {
  if (pathExists(filename)) {
    throw new Error(`The file ${filename} exists.`);
  }
}

function pathExists(path: string | URL) {
  try {
    Edno.statSync(path);
    return true;
  } catch {
    return false;
  }
}

Edno.test(
  { permissions: { read: true, write: true } },
  async function writeFileStream() {
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(new Uint8Array([1]));
        controller.enqueue(new Uint8Array([2]));
        controller.close();
      },
    });
    const filename = Edno.makeTempDirSync() + "/test.txt";
    await Edno.writeFile(filename, stream);
    assertEquals(Edno.readFileSync(filename), new Uint8Array([1, 2]));
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function overwriteFileWithStream() {
    const filename = Edno.makeTempDirSync() + "/test.txt";
    await Edno.writeFile(filename, new Uint8Array([1, 2, 3, 4]));

    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(new Uint8Array([1]));
        controller.enqueue(new Uint8Array([2]));
        controller.close();
      },
    });
    await Edno.writeFile(filename, stream);
    assertEquals(Edno.readFileSync(filename), new Uint8Array([1, 2]));
  },
);

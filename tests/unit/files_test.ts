// Copyright 2018-2026 the Deno authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";
import { copy } from "@std/io/copy";

// Note tests for Edno.FsFile.setRaw is in integration tests.

function changingCreateOptions(): Edno.OpenOptions {
  let writeReads = 0;
  return {
    read: false,
    create: true,
    get write() {
      // Validation reads this getter twice before the op converts the options.
      writeReads++;
      return writeReads <= 2;
    },
  };
}

Edno.test(
  { permissions: { read: true, write: false } },
  function openSyncChangingOptionsChecksConvertedAccess() {
    const path = `open_sync_changing_options_${crypto.randomUUID()}`;

    assertThrows(
      () => Edno.openSync(path, changingCreateOptions()),
      Edno.errors.NotCapable,
    );
  },
);

Edno.test(
  { permissions: { read: true, write: false } },
  async function openChangingOptionsChecksConvertedAccess() {
    const path = `open_changing_options_${crypto.randomUUID()}`;

    await assertRejects(
      () => Edno.open(path, changingCreateOptions()),
      Edno.errors.NotCapable,
    );
  },
);

Edno.test(function filesStdioFileDescriptors() {
  // @ts-ignore `Edno.stdin.rid` was soft-removed in Edno 2.
  assertEquals(Edno.stdin.rid, 0);
  // @ts-ignore `Edno.stdout.rid` was soft-removed in Edno 2.
  assertEquals(Edno.stdout.rid, 1);
  // @ts-ignore `Edno.stderr.rid` was soft-removed in Edno 2.
  assertEquals(Edno.stderr.rid, 2);
});

Edno.test(function fsFileGlobalSymbolCannotConstruct() {
  const FsFileCtor = Edno.FsFile as unknown as new (
    rid: number,
    token: symbol,
  ) => Edno.FsFile;

  assertThrows(
    () => new FsFileCtor(0, Symbol.for("Edno.internal.FsFile")),
    TypeError,
    "'Edno.FsFile' cannot be constructed",
  );
});

Edno.test(
  { permissions: { read: true } },
  async function filesCopyToStdout() {
    const filename = "tests/testdata/assets/fixture.json";
    using file = await Edno.open(filename);
    assert(file instanceof Edno.FsFile);
    const bytesWritten = await copy(file, Edno.stdout);
    const fileSize = Edno.statSync(filename).size;
    assertEquals(bytesWritten, fileSize);
  },
);

Edno.test(
  {
    permissions: { read: true, write: true, sys: ["umask"] },
  },
  function openSyncMode() {
    const path = Edno.makeTempDirSync() + "/test_openSync.txt";
    using _file = Edno.openSync(path, {
      write: true,
      createNew: true,
      mode: 0o626,
    });
    const pathInfo = Edno.statSync(path);
    if (Edno.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o626 & ~Edno.umask());
    }
  },
);

Edno.test(
  {
    permissions: { read: true, write: true, sys: ["umask"] },
  },
  async function openMode() {
    const path = (await Edno.makeTempDir()) + "/test_open.txt";
    using _file = await Edno.open(path, {
      write: true,
      createNew: true,
      mode: 0o626,
    });
    const pathInfo = Edno.statSync(path);
    if (Edno.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o626 & ~Edno.umask());
    }
  },
);

Edno.test(
  {
    permissions: { read: true, write: true, sys: ["umask"] },
  },
  function openSyncUrl() {
    const tempDir = Edno.makeTempDirSync();
    const fileUrl = new URL(
      `file://${
        Edno.build.os === "windows" ? "/" : ""
      }${tempDir}/test_open.txt`,
    );
    using _file = Edno.openSync(fileUrl, {
      write: true,
      createNew: true,
      mode: 0o626,
    });
    const pathInfo = Edno.statSync(fileUrl);
    if (Edno.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o626 & ~Edno.umask());
    }

    Edno.removeSync(tempDir, { recursive: true });
  },
);

Edno.test(
  {
    permissions: { read: true, write: true, sys: ["umask"] },
  },
  async function openUrl() {
    const tempDir = await Edno.makeTempDir();
    const fileUrl = new URL(
      `file://${
        Edno.build.os === "windows" ? "/" : ""
      }${tempDir}/test_open.txt`,
    );
    using _file = await Edno.open(fileUrl, {
      write: true,
      createNew: true,
      mode: 0o626,
    });
    const pathInfo = Edno.statSync(fileUrl);
    if (Edno.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o626 & ~Edno.umask());
    }

    Edno.removeSync(tempDir, { recursive: true });
  },
);

Edno.test(
  { permissions: { write: false } },
  async function writePermFailure() {
    const filename = "tests/hello.txt";
    const openOptions: Edno.OpenOptions[] = [{ write: true }, { append: true }];
    for (const options of openOptions) {
      await assertRejects(async () => {
        await Edno.open(filename, options);
      }, Edno.errors.NotCapable);
    }
  },
);

Edno.test(async function openOptions() {
  const filename = "tests/testdata/assets/fixture.json";
  await assertRejects(
    async () => {
      await Edno.open(filename, { write: false });
    },
    Error,
    "'options' requires at least one option to be true",
  );

  await assertRejects(
    async () => {
      await Edno.open(filename, { truncate: true, write: false });
    },
    Error,
    "'truncate' option requires 'write' to be true",
  );

  await assertRejects(
    async () => {
      await Edno.open(filename, { create: true, write: false });
    },
    Error,
    "'create' or 'createNew' options require 'write' or 'append' to be true",
  );

  await assertRejects(
    async () => {
      await Edno.open(filename, { createNew: true, append: false });
    },
    Error,
    "'create' or 'createNew' options require 'write' or 'append' to be true",
  );
});

Edno.test({ permissions: { read: false } }, async function readPermFailure() {
  await assertRejects(async () => {
    await Edno.open("package.json", { read: true });
  }, Edno.errors.NotCapable);
});

Edno.test(
  { permissions: { write: true } },
  async function writeNullBufferFailure() {
    const tempDir = Edno.makeTempDirSync();
    const filename = tempDir + "hello.txt";
    const w = {
      write: true,
      truncate: true,
      create: true,
    };
    using file = await Edno.open(filename, w);

    // writing null should throw an error
    await assertRejects(
      async () => {
        // edno-lint-ignore no-explicit-any
        await file.write(null as any);
      },
    ); // TODO(bartlomieju): Check error kind when dispatch_minimal pipes errors properly
    await Edno.remove(tempDir, { recursive: true });
  },
);

Edno.test(
  { permissions: { write: true, read: true } },
  async function readNullBufferFailure() {
    const tempDir = Edno.makeTempDirSync();
    const filename = tempDir + "hello.txt";
    using file = await Edno.open(filename, {
      read: true,
      write: true,
      truncate: true,
      create: true,
    });

    // reading into an empty buffer should return 0 immediately
    const bytesRead = await file.read(new Uint8Array(0));
    assert(bytesRead === 0);

    // reading file into null buffer should throw an error
    await assertRejects(async () => {
      // edno-lint-ignore no-explicit-any
      await file.read(null as any);
    }, TypeError);
    // TODO(bartlomieju): Check error kind when dispatch_minimal pipes errors properly

    await Edno.remove(tempDir, { recursive: true });
  },
);

Edno.test(
  { permissions: { write: false, read: false } },
  async function readWritePermFailure() {
    const filename = "tests/hello.txt";
    await assertRejects(async () => {
      await Edno.open(filename, { read: true });
    }, Edno.errors.NotCapable);
  },
);

Edno.test(
  { permissions: { write: true, read: true } },
  async function openNotFound() {
    await assertRejects(
      async () => {
        await Edno.open("bad_file_name");
      },
      Edno.errors.NotFound,
      `open 'bad_file_name'`,
    );
  },
);

Edno.test(
  { permissions: { write: true, read: true } },
  function openSyncNotFound() {
    assertThrows(
      () => {
        Edno.openSync("bad_file_name");
      },
      Edno.errors.NotFound,
      `open 'bad_file_name'`,
    );
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function createFile() {
    const tempDir = await Edno.makeTempDir();
    const filename = tempDir + "/test.txt";
    const f = await Edno.create(filename);
    let fileInfo = Edno.statSync(filename);
    assert(fileInfo.isFile);
    assert(fileInfo.size === 0);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    await f.write(data);
    fileInfo = Edno.statSync(filename);
    assert(fileInfo.size === 5);
    f.close();

    // TODO(bartlomieju): test different modes
    await Edno.remove(tempDir, { recursive: true });
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function createFileWithUrl() {
    const tempDir = await Edno.makeTempDir();
    const fileUrl = new URL(
      `file://${Edno.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    const f = await Edno.create(fileUrl);
    let fileInfo = Edno.statSync(fileUrl);
    assert(fileInfo.isFile);
    assert(fileInfo.size === 0);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    await f.write(data);
    fileInfo = Edno.statSync(fileUrl);
    assert(fileInfo.size === 5);
    f.close();

    await Edno.remove(tempDir, { recursive: true });
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function createSyncFile() {
    const tempDir = await Edno.makeTempDir();
    const filename = tempDir + "/test.txt";
    const f = Edno.createSync(filename);
    let fileInfo = Edno.statSync(filename);
    assert(fileInfo.isFile);
    assert(fileInfo.size === 0);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    await f.write(data);
    fileInfo = Edno.statSync(filename);
    assert(fileInfo.size === 5);
    f.close();

    // TODO(bartlomieju): test different modes
    await Edno.remove(tempDir, { recursive: true });
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function createSyncFileWithUrl() {
    const tempDir = await Edno.makeTempDir();
    const fileUrl = new URL(
      `file://${Edno.build.os === "windows" ? "/" : ""}${tempDir}/test.txt`,
    );
    const f = Edno.createSync(fileUrl);
    let fileInfo = Edno.statSync(fileUrl);
    assert(fileInfo.isFile);
    assert(fileInfo.size === 0);
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    await f.write(data);
    fileInfo = Edno.statSync(fileUrl);
    assert(fileInfo.size === 5);
    f.close();

    await Edno.remove(tempDir, { recursive: true });
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function openModeWrite() {
    const tempDir = Edno.makeTempDirSync();
    const encoder = new TextEncoder();
    const filename = tempDir + "hello.txt";
    const data = encoder.encode("Hello world!\n");
    let file = await Edno.open(filename, {
      create: true,
      write: true,
      truncate: true,
    });
    // assert file was created
    let fileInfo = Edno.statSync(filename);
    assert(fileInfo.isFile);
    assertEquals(fileInfo.size, 0);
    // write some data
    await file.write(data);
    fileInfo = Edno.statSync(filename);
    assertEquals(fileInfo.size, 13);
    // assert we can't read from file
    let thrown = false;
    try {
      const buf = new Uint8Array(20);
      await file.read(buf);
    } catch (_e) {
      thrown = true;
    } finally {
      assert(thrown, "'w' mode shouldn't allow to read file");
    }
    file.close();
    // assert that existing file is truncated on open
    file = await Edno.open(filename, {
      write: true,
      truncate: true,
    });
    file.close();
    const fileSize = Edno.statSync(filename).size;
    assertEquals(fileSize, 0);
    await Edno.remove(tempDir, { recursive: true });
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function openModeWriteRead() {
    const tempDir = Edno.makeTempDirSync();
    const encoder = new TextEncoder();
    const filename = tempDir + "hello.txt";
    const data = encoder.encode("Hello world!\n");

    using file = await Edno.open(filename, {
      write: true,
      truncate: true,
      create: true,
      read: true,
    });
    const seekPosition = 0;
    // assert file was created
    let fileInfo = Edno.statSync(filename);
    assert(fileInfo.isFile);
    assertEquals(fileInfo.size, 0);
    // write some data
    await file.write(data);
    fileInfo = Edno.statSync(filename);
    assertEquals(fileInfo.size, 13);

    const buf = new Uint8Array(20);
    // seeking from beginning of a file
    const cursorPosition = await file.seek(seekPosition, Edno.SeekMode.Start);
    assertEquals(seekPosition, cursorPosition);
    const result = await file.read(buf);
    assertEquals(result, 13);

    await Edno.remove(tempDir, { recursive: true });
  },
);

Edno.test({ permissions: { read: true } }, async function seekStart() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Edno.open(filename);
  const seekPosition = 6;
  // Deliberately move 1 step forward
  await file.read(new Uint8Array(1)); // "H"
  // Skipping "Hello "
  // seeking from beginning of a file plus seekPosition
  const cursorPosition = await file.seek(seekPosition, Edno.SeekMode.Start);
  assertEquals(seekPosition, cursorPosition);
  const buf = new Uint8Array(6);
  await file.read(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Edno.test({ permissions: { read: true } }, async function seekStartBigInt() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Edno.open(filename);
  const seekPosition = 6n;
  // Deliberately move 1 step forward
  await file.read(new Uint8Array(1)); // "H"
  // Skipping "Hello "
  // seeking from beginning of a file plus seekPosition
  const cursorPosition = await file.seek(seekPosition, Edno.SeekMode.Start);
  assertEquals(seekPosition, BigInt(cursorPosition));
  const buf = new Uint8Array(6);
  await file.read(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Edno.test({ permissions: { read: true } }, function seekSyncStart() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = Edno.openSync(filename);
  const seekPosition = 6;
  // Deliberately move 1 step forward
  file.readSync(new Uint8Array(1)); // "H"
  // Skipping "Hello "
  // seeking from beginning of a file plus seekPosition
  const cursorPosition = file.seekSync(seekPosition, Edno.SeekMode.Start);
  assertEquals(seekPosition, cursorPosition);
  const buf = new Uint8Array(6);
  file.readSync(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Edno.test({ permissions: { read: true } }, async function seekCurrent() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Edno.open(filename);
  // Deliberately move 1 step forward
  await file.read(new Uint8Array(1)); // "H"
  // Skipping "ello "
  const seekPosition = 5;
  // seekPosition is relative to current cursor position after read
  const cursorPosition = await file.seek(seekPosition, Edno.SeekMode.Current);
  assertEquals(seekPosition + 1, cursorPosition);
  const buf = new Uint8Array(6);
  await file.read(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Edno.test({ permissions: { read: true } }, function seekSyncCurrent() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = Edno.openSync(filename);
  // Deliberately move 1 step forward
  file.readSync(new Uint8Array(1)); // "H"
  // Skipping "ello "
  const seekPosition = 5;
  // seekPosition is relative to current cursor position after read
  const cursorPosition = file.seekSync(seekPosition, Edno.SeekMode.Current);
  assertEquals(seekPosition + 1, cursorPosition);
  const buf = new Uint8Array(6);
  file.readSync(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Edno.test({ permissions: { read: true } }, async function seekEnd() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Edno.open(filename);
  const seekPosition = -6;
  // seek from end of file that has 12 chars, 12 - 6  = 6
  const cursorPosition = await file.seek(seekPosition, Edno.SeekMode.End);
  assertEquals(6, cursorPosition);
  const buf = new Uint8Array(6);
  await file.read(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Edno.test({ permissions: { read: true } }, function seekSyncEnd() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = Edno.openSync(filename);
  const seekPosition = -6;
  // seek from end of file that has 12 chars, 12 - 6  = 6
  const cursorPosition = file.seekSync(seekPosition, Edno.SeekMode.End);
  assertEquals(6, cursorPosition);
  const buf = new Uint8Array(6);
  file.readSync(buf);
  const decoded = new TextDecoder().decode(buf);
  assertEquals(decoded, "world!");
});

Edno.test({ permissions: { read: true } }, async function seekMode() {
  const filename = "tests/testdata/assets/hello.txt";
  using file = await Edno.open(filename);
  await assertRejects(
    async () => {
      await file.seek(1, -1 as unknown as Edno.SeekMode);
    },
    TypeError,
    "Invalid seek mode",
  );

  // We should still be able to read the file
  // since it is still open.
  const buf = new Uint8Array(1);
  await file.read(buf); // "H"
  assertEquals(new TextDecoder().decode(buf), "H");
});

Edno.test(
  { permissions: { read: true, write: true } },
  function fileTruncateSyncSuccess() {
    const filename = Edno.makeTempDirSync() + "/test_fileTruncateSync.txt";
    using file = Edno.openSync(filename, {
      create: true,
      read: true,
      write: true,
    });

    file.truncateSync(20);
    assertEquals(Edno.readFileSync(filename).byteLength, 20);
    file.truncateSync(5);
    assertEquals(Edno.readFileSync(filename).byteLength, 5);
    file.truncateSync(-5);
    assertEquals(Edno.readFileSync(filename).byteLength, 0);

    Edno.removeSync(filename);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function fileTruncateSuccess() {
    const filename = Edno.makeTempDirSync() + "/test_fileTruncate.txt";
    using file = await Edno.open(filename, {
      create: true,
      read: true,
      write: true,
    });

    await file.truncate(20);
    assertEquals((await Edno.readFile(filename)).byteLength, 20);
    await file.truncate(5);
    assertEquals((await Edno.readFile(filename)).byteLength, 5);
    await file.truncate(-5);
    assertEquals((await Edno.readFile(filename)).byteLength, 0);

    await Edno.remove(filename);
  },
);

Edno.test({ permissions: { read: true } }, function fileStatSyncSuccess() {
  using file = Edno.openSync("README.md");
  const fileInfo = file.statSync();
  assert(fileInfo.isFile);
  assert(!fileInfo.isSymlink);
  assert(!fileInfo.isDirectory);
  assert(fileInfo.size);
  assert(fileInfo.atime);
  assert(fileInfo.mtime);
  // The `birthtime` field is not available on Linux before kernel version 4.11.
  assert(fileInfo.birthtime || Edno.build.os === "linux");
});

Edno.test(async function fileStatSuccess() {
  using file = await Edno.open("README.md");
  const fileInfo = await file.stat();
  assert(fileInfo.isFile);
  assert(!fileInfo.isSymlink);
  assert(!fileInfo.isDirectory);
  assert(fileInfo.size);
  assert(fileInfo.atime);
  assert(fileInfo.mtime);
  // The `birthtime` field is not available on Linux before kernel version 4.11.
  assert(fileInfo.birthtime || Edno.build.os === "linux");
});

Edno.test({ permissions: { read: true } }, async function readableStream() {
  const filename = "tests/testdata/assets/hello.txt";
  const file = await Edno.open(filename);
  assert(file.readable instanceof ReadableStream);
  const chunks = [];
  for await (const chunk of file.readable) {
    chunks.push(chunk);
  }
  assertEquals(chunks.length, 1);
  assertEquals(chunks[0].byteLength, 12);
});

Edno.test(
  {
    permissions: { read: true },
    sanitizeOps: true,
    sanitizeResources: true,
  },
  async function readableStreamTakesOwnership() {
    // Consuming `file.readable` to completion takes ownership of the file and
    // closes it automatically, so the resource and op sanitizers should not
    // report a leak even though `file` is never closed manually.
    const filename = "tests/testdata/assets/hello.txt";
    const file = await Edno.open(filename);
    const chunks = await Array.fromAsync(file.readable);
    assertEquals(chunks.length, 1);
  },
);

Edno.test(
  { permissions: { read: true } },
  async function readableStreamClosedResourceErrorMessage() {
    // Regression test for https://github.com/denoland/deno/issues/34958 —
    // closing the file (e.g. via a `using` declaration or an explicit
    // `.close()`) while its `.readable` stream is still being consumed should
    // surface an actionable error rather than a terse "Bad resource ID".
    const filename = "tests/testdata/assets/hello.txt";
    const file = await Edno.open(filename);
    const reader = file.readable.getReader();
    file.close();
    await assertRejects(
      () => reader.read(),
      Error,
      "The stream's underlying resource was closed or consumed",
    );
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writableStreamClosedResourceErrorMessage() {
    // Regression test for https://github.com/denoland/deno/issues/34958 —
    // the writable counterpart of the case above.
    const tempFile = await Edno.makeTempFile();
    try {
      const file = await Edno.open(tempFile, { write: true });
      const writer = file.writable.getWriter();
      file.close();
      // The file's writable stream buffers small writes (64 KiB), so write a
      // chunk large enough to be flushed to the underlying resource directly.
      // The flush errors the stream; the error surfaces on `writer.closed`.
      await assertRejects(
        async () => {
          await writer.write(new Uint8Array(128 * 1024)).catch(() => {});
          await writer.closed;
        },
        Error,
        "The stream's underlying resource was closed or consumed",
      );
    } finally {
      await Edno.remove(tempFile);
    }
  },
);

Edno.test(
  { permissions: { read: true } },
  async function readableStreamTextEncoderPipe() {
    const filename = "tests/testdata/assets/hello.txt";
    const file = await Edno.open(filename);
    const readable = file.readable.pipeThrough(new TextDecoderStream());
    const chunks = [];
    for await (const chunk of readable) {
      chunks.push(chunk);
    }
    assertEquals(chunks.length, 1);
    assertEquals(chunks[0].length, 12);
  },
);

Edno.test(
  {
    permissions: { read: true, write: true, run: true },
    ignore: Edno.build.os === "windows",
  },
  async function readableStreamCancelOnFifo() {
    // Regression test for https://github.com/denoland/deno/issues/21186
    // — a `read` on a FIFO can block indefinitely waiting for data, and
    // previously cancelling the wrapping `ReadableStream` would not
    // unblock the in-flight `op_read`. As a result, the runtime would
    // hang on exit even after JS had finished. We verify the fix by
    // running a subprocess that opens a FIFO, starts a read, cancels
    // it, and is expected to exit promptly. Without the fix the
    // subprocess would hang until killed.
    const tempDir = await Edno.makeTempDir();
    const fifo = `${tempDir}/fifo`;
    try {
      const mkfifo = new Edno.Command("mkfifo", { args: [fifo] }).outputSync();
      if (mkfifo.code !== 0) {
        throw new Error(
          `mkfifo failed: ${new TextDecoder().decode(mkfifo.stderr)}`,
        );
      }
      const script = `
        const fifo = ${JSON.stringify(fifo)};
        // O_RDWR avoids the POSIX FIFO open-blocks-on-peer semantics.
        const file = await Edno.open(fifo, { read: true, write: true });
        const r = file.readable.getReader();
        const reading = r.read();
        await new Promise((res) => setTimeout(res, 50));
        await r.cancel();
        await reading;
      `;
      const out = await new Edno.Command(Edno.execPath(), {
        args: ["eval", script],
        stdout: "null",
        stderr: "piped",
        signal: AbortSignal.timeout(10_000),
      }).output();
      if (out.signal !== null) {
        throw new Error(
          "subprocess hung after stream cancellation — read was not cancelled",
        );
      }
      assertEquals(
        out.code,
        0,
        `subprocess failed: ${new TextDecoder().decode(out.stderr)}`,
      );
    } finally {
      await Edno.remove(tempDir, { recursive: true });
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function writableStream() {
    const path = await Edno.makeTempFile();
    const file = await Edno.open(path, { write: true });
    assert(file.writable instanceof WritableStream);
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("hello "));
        controller.enqueue(new TextEncoder().encode("world!"));
        controller.close();
      },
    });
    await readable.pipeTo(file.writable);
    const res = await Edno.readTextFile(path);
    assertEquals(res, "hello world!");
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function readTextFileNonUtf8() {
    const path = await Edno.makeTempFile();
    using file = await Edno.open(path, { write: true });
    await file.write(new TextEncoder().encode("hello "));
    await file.write(new Uint8Array([0xC0]));

    const res = await Edno.readTextFile(path);
    const resSync = Edno.readTextFileSync(path);
    assertEquals(res, resSync);
    assertEquals(res, "hello \uFFFD");
  },
);

Edno.test(
  { permissions: { read: true } },
  async function fsFileExplicitResourceManagement() {
    let file2: Edno.FsFile;

    {
      using file = await Edno.open("tests/testdata/assets/hello.txt");
      file2 = file;

      const stat = file.statSync();
      assert(stat.isFile);
    }

    assertThrows(() => file2.statSync(), Edno.errors.BadResource);
  },
);

Edno.test(
  { permissions: { read: true } },
  async function fsFileExplicitResourceManagementManualClose() {
    using file = await Edno.open("tests/testdata/assets/hello.txt");
    file.close();
    assertThrows(() => file.statSync(), Edno.errors.BadResource); // definitely closed
    // calling [Symbol.dispose] after manual close is a no-op
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function fsFileDatasyncSyncSuccess() {
    const filename = Edno.makeTempDirSync() + "/test_fdatasyncSync.txt";
    const file = Edno.openSync(filename, {
      read: true,
      write: true,
      create: true,
    });
    const data = new Uint8Array(64);
    file.writeSync(data);
    file.syncDataSync();
    assertEquals(Edno.readFileSync(filename), data);
    file.close();
    Edno.removeSync(filename);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function fsFileDatasyncSuccess() {
    const filename = (await Edno.makeTempDir()) + "/test_fdatasync.txt";
    const file = await Edno.open(filename, {
      read: true,
      write: true,
      create: true,
    });
    const data = new Uint8Array(64);
    await file.write(data);
    await file.syncData();
    assertEquals(await Edno.readFile(filename), data);
    file.close();
    await Edno.remove(filename);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function fsFileSyncSyncSuccess() {
    const filename = Edno.makeTempDirSync() + "/test_fsyncSync.txt";
    const file = Edno.openSync(filename, {
      read: true,
      write: true,
      create: true,
    });
    const size = 64;
    file.truncateSync(size);
    file.syncSync();
    assertEquals(file.statSync().size, size);
    file.close();
    Edno.removeSync(filename);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function fsFileSyncSuccess() {
    const filename = (await Edno.makeTempDir()) + "/test_fsync.txt";
    const file = await Edno.open(filename, {
      read: true,
      write: true,
      create: true,
    });
    const size = 64;
    await file.truncate(size);
    await file.sync();
    assertEquals((await file.stat()).size, size);
    file.close();
    await Edno.remove(filename);
  },
);

Edno.test({ permissions: { read: true } }, function fsFileIsTerminal() {
  // CI not under TTY, so cannot test stdin/stdout/stderr.
  using file = Edno.openSync("tests/testdata/assets/hello.txt");
  assert(!file.isTerminal());
});

Edno.test(
  { permissions: { read: true, run: true } },
  async function fsFileLockFileSync() {
    await runFlockTests({ sync: true });
  },
);

Edno.test(
  { permissions: { read: true, run: true } },
  async function fsFileLockFileAsync() {
    await runFlockTests({ sync: false });
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function fsFileTryLockSync() {
    const path = Edno.makeTempFileSync();
    try {
      using file1 = Edno.openSync(path, { read: true, write: true });
      using file2 = Edno.openSync(path, { read: true, write: true });

      // First lock should succeed
      assertEquals(file1.tryLockSync(true), true);

      // Second exclusive lock should fail (returns false, not block)
      assertEquals(file2.tryLockSync(true), false);

      // Shared lock should also fail when exclusive is held
      assertEquals(file2.tryLockSync(false), false);

      // Unlock first file
      file1.unlockSync();

      // Now second file should be able to lock
      assertEquals(file2.tryLockSync(true), true);
      file2.unlockSync();
    } finally {
      Edno.removeSync(path);
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function fsFileTryLockAsync() {
    const path = await Edno.makeTempFile();
    try {
      using file1 = await Edno.open(path, { read: true, write: true });
      using file2 = await Edno.open(path, { read: true, write: true });

      // First lock should succeed
      assertEquals(await file1.tryLock(true), true);

      // Second exclusive lock should fail (returns false, not block)
      assertEquals(await file2.tryLock(true), false);

      // Shared lock should also fail when exclusive is held
      assertEquals(await file2.tryLock(false), false);

      // Unlock first file
      await file1.unlock();

      // Now second file should be able to lock
      assertEquals(await file2.tryLock(true), true);
      await file2.unlock();
    } finally {
      await Edno.remove(path);
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function fsFileTryLockSharedSync() {
    const path = Edno.makeTempFileSync();
    try {
      using file1 = Edno.openSync(path, { read: true, write: true });
      using file2 = Edno.openSync(path, { read: true, write: true });

      // First shared lock should succeed
      assertEquals(file1.tryLockSync(false), true);

      // Second shared lock should also succeed
      assertEquals(file2.tryLockSync(false), true);

      // Exclusive lock should fail when shared locks are held
      using file3 = Edno.openSync(path, { read: true, write: true });
      assertEquals(file3.tryLockSync(true), false);

      file1.unlockSync();
      file2.unlockSync();
    } finally {
      Edno.removeSync(path);
    }
  },
);

async function runFlockTests(opts: { sync: boolean }) {
  assertEquals(
    await checkFirstBlocksSecond({
      firstExclusive: true,
      secondExclusive: false,
      sync: opts.sync,
    }),
    true,
    "exclusive blocks shared",
  );
  assertEquals(
    await checkFirstBlocksSecond({
      firstExclusive: false,
      secondExclusive: true,
      sync: opts.sync,
    }),
    true,
    "shared blocks exclusive",
  );
  assertEquals(
    await checkFirstBlocksSecond({
      firstExclusive: true,
      secondExclusive: true,
      sync: opts.sync,
    }),
    true,
    "exclusive blocks exclusive",
  );
  assertEquals(
    await checkFirstBlocksSecond({
      firstExclusive: false,
      secondExclusive: false,
      sync: opts.sync,
      // need to wait for both to enter the lock to prevent the case where the
      // first process enters and exits the lock before the second even enters
      waitBothEnteredLock: true,
    }),
    false,
    "shared does not block shared",
  );
}

async function checkFirstBlocksSecond(opts: {
  firstExclusive: boolean;
  secondExclusive: boolean;
  sync: boolean;
  waitBothEnteredLock?: boolean;
}) {
  const firstProcess = runFlockTestProcess({
    exclusive: opts.firstExclusive,
    sync: opts.sync,
  });
  const secondProcess = runFlockTestProcess({
    exclusive: opts.secondExclusive,
    sync: opts.sync,
  });
  try {
    const sleep = (time: number) => new Promise((r) => setTimeout(r, time));

    await Promise.all([
      firstProcess.waitStartup(),
      secondProcess.waitStartup(),
    ]);

    await firstProcess.enterLock();
    await firstProcess.waitEnterLock();

    await secondProcess.enterLock();
    await sleep(100);

    if (!opts.waitBothEnteredLock) {
      await firstProcess.exitLock();
    }

    await secondProcess.waitEnterLock();

    if (opts.waitBothEnteredLock) {
      await firstProcess.exitLock();
    }

    await secondProcess.exitLock();

    // collect the final output
    const firstPsTimes = await firstProcess.getTimes();
    const secondPsTimes = await secondProcess.getTimes();
    return firstPsTimes.exitTime < secondPsTimes.enterTime;
  } finally {
    await firstProcess.close();
    await secondProcess.close();
  }
}

function runFlockTestProcess(opts: { exclusive: boolean; sync: boolean }) {
  const path = "tests/testdata/assets/lock_target.txt";
  const scriptText = `
    const file = Edno.openSync("${path}");

    // ready signal
    Edno.stdout.writeSync(new Uint8Array(1));
    // wait for enter lock signal
    Edno.stdin.readSync(new Uint8Array(1));

    // entering signal
    Edno.stdout.writeSync(new Uint8Array(1));
    // lock and record the entry time
    ${
    opts.sync
      ? `file.lockSync(${opts.exclusive ? "true" : "false"});`
      : `await file.lock(${opts.exclusive ? "true" : "false"});`
  }
    const enterTime = new Date().getTime();
    // entered signal
    Edno.stdout.writeSync(new Uint8Array(1));

    // wait for exit lock signal
    Edno.stdin.readSync(new Uint8Array(1));

    // record the exit time and wait a little bit before releasing
    // the lock so that the enter time of the next process doesn't
    // occur at the same time as this exit time
    const exitTime = new Date().getTime();
    await new Promise(resolve => setTimeout(resolve, 100));

    // release the lock
    ${opts.sync ? "file.unlockSync();" : "await file.unlock();"}

    // exited signal
    Edno.stdout.writeSync(new Uint8Array(1));

    // output the enter and exit time
    console.log(JSON.stringify({ enterTime, exitTime }));
`;

  const process = new Edno.Command(Edno.execPath(), {
    args: ["eval", scriptText],
    stdin: "piped",
    stdout: "piped",
    stderr: "null",
  }).spawn();

  const waitSignal = async () => {
    const reader = process.stdout.getReader({ mode: "byob" });
    await reader.read(new Uint8Array(1));
    reader.releaseLock();
  };
  const signal = async () => {
    const writer = process.stdin.getWriter();
    await writer.write(new Uint8Array(1));
    writer.releaseLock();
  };

  return {
    async waitStartup() {
      await waitSignal();
    },
    async enterLock() {
      await signal();
      await waitSignal(); // entering signal
    },
    async waitEnterLock() {
      await waitSignal();
    },
    async exitLock() {
      await signal();
      await waitSignal();
    },
    getTimes: async () => {
      const { stdout } = await process.output();
      const text = new TextDecoder().decode(stdout);
      return JSON.parse(text) as {
        enterTime: number;
        exitTime: number;
      };
    },
    close: async () => {
      await process.status;
      await process.stdin.close();
    },
  };
}

// Copyright 2018-2026 the Deno authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
  unreachable,
} from "./test_util.ts";

Edno.test({ permissions: { read: true } }, function readTextFileSyncSuccess() {
  const data = Edno.readTextFileSync("tests/testdata/assets/fixture.json");
  assert(data.length > 0);
  const pkg = JSON.parse(data);
  assertEquals(pkg.name, "edno");
});

Edno.test({ permissions: { read: true } }, function readTextFileSyncByUrl() {
  const data = Edno.readTextFileSync(
    pathToAbsoluteFileUrl("tests/testdata/assets/fixture.json"),
  );
  assert(data.length > 0);
  const pkg = JSON.parse(data);
  assertEquals(pkg.name, "edno");
});

Edno.test({ permissions: { read: false } }, function readTextFileSyncPerm() {
  assertThrows(() => {
    Edno.readTextFileSync("tests/testdata/assets/fixture.json");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { read: true } }, function readTextFileSyncNotFound() {
  assertThrows(() => {
    Edno.readTextFileSync("bad_filename");
  }, Edno.errors.NotFound);
});

// Reading a broken (dangling) symlink should report NotFound, not
// FilesystemLoop ("Too many levels of symbolic links"). The canonicalized
// path is opened with O_NOFOLLOW, which reports a surviving symlink tail as
// ELOOP; that is translated to ENOENT. Regression test for
// https://github.com/denoland/deno/issues/29139
Edno.test(
  {
    permissions: { read: true, write: true },
    ignore: Edno.build.os === "windows",
  },
  function readTextFileSyncBrokenSymlink() {
    const testDir = Edno.makeTempDirSync();
    const target = testDir + "/target.txt";
    const link = testDir + "/link.txt";
    Edno.writeTextFileSync(target, "hello");
    Edno.symlinkSync(target, link);
    // The link resolves while the target exists.
    assertEquals(Edno.readTextFileSync(link), "hello");
    // Once the target is gone the link is broken.
    Edno.removeSync(target);
    assertThrows(() => Edno.readTextFileSync(link), Edno.errors.NotFound);
  },
);

Edno.test(
  { permissions: { read: true } },
  async function readTextFileSuccess() {
    const data = await Edno.readTextFile(
      "tests/testdata/assets/fixture.json",
    );
    assert(data.length > 0);
    const pkg = JSON.parse(data);
    assertEquals(pkg.name, "edno");
  },
);

Edno.test({ permissions: { read: true } }, async function readTextFileByUrl() {
  const data = await Edno.readTextFile(
    pathToAbsoluteFileUrl("tests/testdata/assets/fixture.json"),
  );
  assert(data.length > 0);
  const pkg = JSON.parse(data);
  assertEquals(pkg.name, "edno");
});

Edno.test({ permissions: { read: false } }, async function readTextFilePerm() {
  await assertRejects(async () => {
    await Edno.readTextFile("tests/testdata/assets/fixture.json");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { read: true } }, function readTextFileSyncLoop() {
  for (let i = 0; i < 256; i++) {
    Edno.readTextFileSync("tests/testdata/assets/fixture.json");
  }
});

Edno.test(
  { permissions: { read: true } },
  async function readTextFileDoesNotLeakResources() {
    await assertRejects(async () => await Edno.readTextFile("cli"));
  },
);

Edno.test(
  { permissions: { read: true } },
  function readTextFileSyncDoesNotLeakResources() {
    assertThrows(() => Edno.readTextFileSync("cli"));
  },
);

Edno.test(
  { permissions: { read: true } },
  async function readTextFileWithAbortSignal() {
    const ac = new AbortController();
    queueMicrotask(() => ac.abort());
    const error = await assertRejects(
      async () => {
        await Edno.readTextFile("tests/testdata/assets/fixture.json", {
          signal: ac.signal,
        });
      },
    );
    assert(error instanceof DOMException);
    assertEquals(error.name, "AbortError");
  },
);

Edno.test(
  { permissions: { read: true } },
  async function readTextFileWithAbortSignalReason() {
    const ac = new AbortController();
    const abortReason = new Error();
    queueMicrotask(() => ac.abort(abortReason));
    const error = await assertRejects(
      async () => {
        await Edno.readTextFile("tests/testdata/assets/fixture.json", {
          signal: ac.signal,
        });
      },
    );
    assertEquals(error, abortReason);
  },
);

Edno.test(
  { permissions: { read: true } },
  async function readTextFileWithAbortSignalPrimitiveReason() {
    const ac = new AbortController();
    queueMicrotask(() => ac.abort("Some string"));
    try {
      await Edno.readTextFile("tests/testdata/assets/fixture.json", {
        signal: ac.signal,
      });
      unreachable();
    } catch (e) {
      assertEquals(e, "Some string");
    }
  },
);

// Test that AbortController's cancel handle is cleaned-up correctly, and do not leak resources.
Edno.test(
  { permissions: { read: true } },
  async function readTextFileWithAbortSignalNotCalled() {
    const ac = new AbortController();
    await Edno.readTextFile("tests/testdata/assets/fixture.json", {
      signal: ac.signal,
    });
  },
);

Edno.test(
  { ignore: Edno.build.os !== "linux" },
  async function readTextFileProcFs() {
    const data = await Edno.readTextFile("/proc/self/stat");
    assert(data.length > 0);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function readTextFileSyncV8LimitError() {
    const kStringMaxLengthPlusOne = 536870888 + 1;
    const bytes = new Uint8Array(kStringMaxLengthPlusOne);
    const filePath = "tests/testdata/too_big_a_file.txt";

    try {
      Edno.writeFileSync(filePath, bytes);
    } catch {
      // NOTE(bartlomieju): writing a 0.5Gb file might be too much for CI,
      // so skip running if writing fails.
      return;
    }

    assertThrows(
      () => {
        Edno.readTextFileSync(filePath);
      },
      TypeError,
      "buffer exceeds maximum length",
    );

    Edno.removeSync(filePath);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function readTextFileV8LimitError() {
    const kStringMaxLengthPlusOne = 536870888 + 1;
    const bytes = new Uint8Array(kStringMaxLengthPlusOne);
    const filePath = "tests/testdata/too_big_a_file_2.txt";

    try {
      await Edno.writeFile(filePath, bytes);
    } catch {
      // NOTE(bartlomieju): writing a 0.5Gb file might be too much for CI,
      // so skip running if writing fails.
      return;
    }

    await assertRejects(
      async () => {
        await Edno.readTextFile(filePath);
      },
      TypeError,
      "buffer exceeds maximum length",
    );

    await Edno.remove(filePath);
  },
);

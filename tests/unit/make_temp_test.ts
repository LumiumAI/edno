// Copyright 2018-2026 the Deno authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";

Edno.test({ permissions: { write: true } }, function makeTempDirSyncSuccess() {
  const dir1 = Edno.makeTempDirSync({ prefix: "hello", suffix: "world" });
  const dir2 = Edno.makeTempDirSync({ prefix: "hello", suffix: "world" });
  // Check that both dirs are different.
  assert(dir1 !== dir2);
  for (const dir of [dir1, dir2]) {
    // Check that the prefix and suffix are applied.
    const lastPart = dir.replace(/^.*[\\\/]/, "");
    assert(lastPart.startsWith("hello"));
    assert(lastPart.endsWith("world"));
  }
  // Check that the `dir` option works.
  const dir3 = Edno.makeTempDirSync({ dir: dir1 });
  assert(dir3.startsWith(dir1));
  assert(/^[\\\/]/.test(dir3.slice(dir1.length)));
  // Check that creating a temp dir inside a nonexisting directory fails.
  assertThrows(() => {
    Edno.makeTempDirSync({ dir: "/baddir" });
  }, Edno.errors.NotFound);
});

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function makeTempDirSyncMode() {
    const path = Edno.makeTempDirSync();
    const pathInfo = Edno.statSync(path);
    if (Edno.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o700 & ~Edno.umask());
    }
  },
);

Edno.test({ permissions: { write: false } }, function makeTempDirSyncPerm() {
  // makeTempDirSync should require write permissions (for now).
  assertThrows(() => {
    Edno.makeTempDirSync({ dir: "/baddir" });
  }, Edno.errors.NotCapable);
});

Edno.test(
  { permissions: { write: true } },
  async function makeTempDirSuccess() {
    const dir1 = await Edno.makeTempDir({ prefix: "hello", suffix: "world" });
    const dir2 = await Edno.makeTempDir({ prefix: "hello", suffix: "world" });
    // Check that both dirs are different.
    assert(dir1 !== dir2);
    for (const dir of [dir1, dir2]) {
      // Check that the prefix and suffix are applied.
      const lastPart = dir.replace(/^.*[\\\/]/, "");
      assert(lastPart.startsWith("hello"));
      assert(lastPart.endsWith("world"));
    }
    // Check that the `dir` option works.
    const dir3 = await Edno.makeTempDir({ dir: dir1 });
    assert(dir3.startsWith(dir1));
    assert(/^[\\\/]/.test(dir3.slice(dir1.length)));
    // Check that creating a temp dir inside a nonexisting directory fails.
    await assertRejects(async () => {
      await Edno.makeTempDir({ dir: "/baddir" });
    }, Edno.errors.NotFound);
  },
);

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function makeTempDirMode() {
    const path = await Edno.makeTempDir();
    const pathInfo = Edno.statSync(path);
    if (Edno.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o700 & ~Edno.umask());
    }
  },
);

Edno.test({ permissions: { write: true } }, function makeTempFileSyncSuccess() {
  const file1 = Edno.makeTempFileSync({ prefix: "hello", suffix: "world" });
  const file2 = Edno.makeTempFileSync({ prefix: "hello", suffix: "world" });
  // Check that both dirs are different.
  assert(file1 !== file2);
  for (const dir of [file1, file2]) {
    // Check that the prefix and suffix are applied.
    const lastPart = dir.replace(/^.*[\\\/]/, "");
    assert(lastPart.startsWith("hello"));
    assert(lastPart.endsWith("world"));
  }
  // Check that the `dir` option works.
  const dir = Edno.makeTempDirSync({ prefix: "tempdir" });
  const file3 = Edno.makeTempFileSync({ dir });
  assert(file3.startsWith(dir));
  assert(/^[\\\/]/.test(file3.slice(dir.length)));
  // Check that creating a temp file inside a nonexisting directory fails.
  assertThrows(() => {
    Edno.makeTempFileSync({ dir: "/baddir" });
  }, Edno.errors.NotFound);
});

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function makeTempFileSyncMode() {
    const path = Edno.makeTempFileSync();
    const pathInfo = Edno.statSync(path);
    if (Edno.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o600 & ~Edno.umask());
    }
  },
);

Edno.test({ permissions: { write: false } }, function makeTempFileSyncPerm() {
  // makeTempFileSync should require write permissions (for now).
  assertThrows(() => {
    Edno.makeTempFileSync({ dir: "/baddir" });
  }, Edno.errors.NotCapable);
});

Edno.test(
  { permissions: { write: true } },
  async function makeTempFileSuccess() {
    const file1 = await Edno.makeTempFile({ prefix: "hello", suffix: "world" });
    const file2 = await Edno.makeTempFile({ prefix: "hello", suffix: "world" });
    // Check that both dirs are different.
    assert(file1 !== file2);
    for (const dir of [file1, file2]) {
      // Check that the prefix and suffix are applied.
      const lastPart = dir.replace(/^.*[\\\/]/, "");
      assert(lastPart.startsWith("hello"));
      assert(lastPart.endsWith("world"));
    }
    // Check that the `dir` option works.
    const dir = Edno.makeTempDirSync({ prefix: "tempdir" });
    const file3 = await Edno.makeTempFile({ dir });
    assert(file3.startsWith(dir));
    assert(/^[\\\/]/.test(file3.slice(dir.length)));
    // Check that creating a temp file inside a nonexisting directory fails.
    await assertRejects(async () => {
      await Edno.makeTempFile({ dir: "/baddir" });
    }, Edno.errors.NotFound);
  },
);

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function makeTempFileMode() {
    const path = await Edno.makeTempFile();
    const pathInfo = Edno.statSync(path);
    if (Edno.build.os !== "windows") {
      assertEquals(pathInfo.mode! & 0o777, 0o600 & ~Edno.umask());
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function makeTempInvalidCharacter() {
    // Various control and ASCII characters that are disallowed on all platforms
    for (const invalid of ["\0", "*", "\x9f"]) {
      assertThrows(() => Edno.makeTempFileSync({ prefix: invalid }));
      assertThrows(() => Edno.makeTempDirSync({ prefix: invalid }));
      assertThrows(() => Edno.makeTempFileSync({ suffix: invalid }));
      assertThrows(() => Edno.makeTempDirSync({ suffix: invalid }));
    }

    // On Windows, files can't end with space or period
    if (Edno.build.os === "windows") {
      assertThrows(() => Edno.makeTempFileSync({ suffix: "." }));
      assertThrows(() => Edno.makeTempFileSync({ suffix: " " }));
    } else {
      Edno.makeTempFileSync({ suffix: "." });
      Edno.makeTempFileSync({ suffix: " " });
    }
  },
);

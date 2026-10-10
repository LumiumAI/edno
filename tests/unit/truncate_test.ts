// Copyright 2018-2026 the Deno authors. MIT license.
import { assertEquals, assertRejects, assertThrows } from "./test_util.ts";

Edno.test(
  { permissions: { read: true, write: true } },
  function ftruncateSyncSuccess() {
    const filename = Edno.makeTempDirSync() + "/test_ftruncateSync.txt";
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
  async function ftruncateSuccess() {
    const filename = Edno.makeTempDirSync() + "/test_ftruncate.txt";
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

Edno.test(
  { permissions: { read: true, write: true } },
  function truncateSyncSuccess() {
    const filename = Edno.makeTempDirSync() + "/test_truncateSync.txt";
    Edno.writeFileSync(filename, new Uint8Array(5));
    Edno.truncateSync(filename, 20);
    assertEquals(Edno.readFileSync(filename).byteLength, 20);
    Edno.truncateSync(filename, 5);
    assertEquals(Edno.readFileSync(filename).byteLength, 5);
    Edno.truncateSync(filename, -5);
    assertEquals(Edno.readFileSync(filename).byteLength, 0);
    Edno.removeSync(filename);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function truncateSuccess() {
    const filename = Edno.makeTempDirSync() + "/test_truncate.txt";
    await Edno.writeFile(filename, new Uint8Array(5));
    await Edno.truncate(filename, 20);
    assertEquals((await Edno.readFile(filename)).byteLength, 20);
    await Edno.truncate(filename, 5);
    assertEquals((await Edno.readFile(filename)).byteLength, 5);
    await Edno.truncate(filename, -5);
    assertEquals((await Edno.readFile(filename)).byteLength, 0);
    await Edno.remove(filename);
  },
);

Edno.test({ permissions: { write: false } }, function truncateSyncPerm() {
  assertThrows(() => {
    Edno.truncateSync("/test_truncateSyncPermission.txt");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { write: false } }, async function truncatePerm() {
  await assertRejects(async () => {
    await Edno.truncate("/test_truncatePermission.txt");
  }, Edno.errors.NotCapable);
});

Edno.test(
  { permissions: { read: true, write: true } },
  function truncateSyncNotFound() {
    const filename = "/badfile.txt";
    assertThrows(
      () => {
        Edno.truncateSync(filename);
      },
      Edno.errors.NotFound,
      `truncate '${filename}'`,
    );
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function truncateSyncNotFound() {
    const filename = "/badfile.txt";
    await assertRejects(
      async () => {
        await Edno.truncate(filename);
      },
      Edno.errors.NotFound,
      `truncate '${filename}'`,
    );
  },
);

// truncate does not follow a terminal symlink: the permission check is done
// no-follow, so a symlink at an allowed path must not be usable to zero out a
// file it points to. The open uses O_NOFOLLOW and fails with FilesystemLoop
// (ELOOP) on a symlink target, rather than a permission error or silently
// truncating the link's target.
Edno.test(
  {
    permissions: { read: true, write: true },
    ignore: Edno.build.os === "windows",
  },
  function truncateSyncDoesNotFollowSymlink() {
    const dir = Edno.makeTempDirSync();
    const target = dir + "/target.txt";
    const link = dir + "/link.txt";
    Edno.writeFileSync(target, new Uint8Array([1, 2, 3, 4, 5]));
    Edno.symlinkSync(target, link);

    assertThrows(
      () => Edno.truncateSync(link, 0),
      Edno.errors.FilesystemLoop,
    );
    assertEquals(Edno.readFileSync(target).byteLength, 5);
  },
);

Edno.test(
  {
    permissions: { read: true, write: true },
    ignore: Edno.build.os === "windows",
  },
  async function truncateDoesNotFollowSymlink() {
    const dir = Edno.makeTempDirSync();
    const target = dir + "/target.txt";
    const link = dir + "/link.txt";
    await Edno.writeFile(target, new Uint8Array([1, 2, 3, 4, 5]));
    await Edno.symlink(target, link);

    await assertRejects(
      () => Edno.truncate(link, 0),
      Edno.errors.FilesystemLoop,
    );
    assertEquals((await Edno.readFile(target)).byteLength, 5);
  },
);

// O_NOFOLLOW only protects the final path component. A symlink in an ancestor
// directory is still resolved, so truncating a regular file reached through a
// symlinked directory continues to work.
Edno.test(
  {
    permissions: { read: true, write: true },
    ignore: Edno.build.os === "windows",
  },
  function truncateSyncFollowsIntermediateSymlink() {
    const dir = Edno.makeTempDirSync();
    const realDir = dir + "/real";
    Edno.mkdirSync(realDir);
    const file = realDir + "/data.txt";
    Edno.writeFileSync(file, new Uint8Array([1, 2, 3, 4, 5]));
    const linkDir = dir + "/linkdir";
    Edno.symlinkSync(realDir, linkDir);

    Edno.truncateSync(linkDir + "/data.txt", 2);
    assertEquals(Edno.readFileSync(file).byteLength, 2);
  },
);

Edno.test(
  {
    permissions: { read: true, write: true },
    ignore: Edno.build.os === "windows",
  },
  async function truncateFollowsIntermediateSymlink() {
    const dir = Edno.makeTempDirSync();
    const realDir = dir + "/real";
    await Edno.mkdir(realDir);
    const file = realDir + "/data.txt";
    await Edno.writeFile(file, new Uint8Array([1, 2, 3, 4, 5]));
    const linkDir = dir + "/linkdir";
    await Edno.symlink(realDir, linkDir);

    await Edno.truncate(linkDir + "/data.txt", 2);
    assertEquals((await Edno.readFile(file)).byteLength, 2);
  },
);

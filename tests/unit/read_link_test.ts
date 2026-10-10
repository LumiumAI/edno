// Copyright 2018-2026 the Deno authors. MIT license.
import {
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

Edno.test(
  { permissions: { write: true, read: true } },
  function readLinkSyncSuccess() {
    const testDir = Edno.makeTempDirSync();
    const target = testDir +
      (Edno.build.os == "windows" ? "\\target" : "/target");
    const symlink = testDir +
      (Edno.build.os == "windows" ? "\\symlink" : "/symlink");
    Edno.mkdirSync(target);
    Edno.symlinkSync(target, symlink);
    const targetPath = Edno.readLinkSync(symlink);
    assertEquals(targetPath, target);
  },
);

Edno.test(
  { permissions: { write: true, read: true } },
  function readLinkSyncUrlSuccess() {
    const testDir = Edno.makeTempDirSync();
    const target = testDir +
      (Edno.build.os == "windows" ? "\\target" : "/target");
    const symlink = testDir +
      (Edno.build.os == "windows" ? "\\symlink" : "/symlink");
    Edno.mkdirSync(target);
    Edno.symlinkSync(target, symlink);
    const targetPath = Edno.readLinkSync(pathToAbsoluteFileUrl(symlink));
    assertEquals(targetPath, target);
  },
);

Edno.test({ permissions: { read: false } }, function readLinkSyncPerm() {
  assertThrows(() => {
    Edno.readLinkSync("/symlink");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { read: true } }, function readLinkSyncNotFound() {
  assertThrows(
    () => {
      Edno.readLinkSync("bad_filename");
    },
    Edno.errors.NotFound,
    `readlink 'bad_filename'`,
  );
});

Edno.test(
  { permissions: { write: true, read: true } },
  async function readLinkSuccess() {
    const testDir = Edno.makeTempDirSync();
    const target = testDir +
      (Edno.build.os == "windows" ? "\\target" : "/target");
    const symlink = testDir +
      (Edno.build.os == "windows" ? "\\symlink" : "/symlink");
    Edno.mkdirSync(target);
    Edno.symlinkSync(target, symlink);
    const targetPath = await Edno.readLink(symlink);
    assertEquals(targetPath, target);
  },
);

Edno.test(
  { permissions: { write: true, read: true } },
  async function readLinkUrlSuccess() {
    const testDir = Edno.makeTempDirSync();
    const target = testDir +
      (Edno.build.os == "windows" ? "\\target" : "/target");
    const symlink = testDir +
      (Edno.build.os == "windows" ? "\\symlink" : "/symlink");
    Edno.mkdirSync(target);
    Edno.symlinkSync(target, symlink);
    const targetPath = await Edno.readLink(pathToAbsoluteFileUrl(symlink));
    assertEquals(targetPath, target);
  },
);

Edno.test({ permissions: { read: false } }, async function readLinkPerm() {
  await assertRejects(async () => {
    await Edno.readLink("/symlink");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { read: true } }, async function readLinkNotFound() {
  await assertRejects(
    async () => {
      await Edno.readLink("bad_filename");
    },
    Edno.errors.NotFound,
    `readlink 'bad_filename'`,
  );
});

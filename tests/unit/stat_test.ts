// Copyright 2018-2026 the Deno authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

Edno.test(
  { permissions: { read: true, write: true } },
  function statSyncSuccess() {
    const readmeInfo = Edno.statSync("README.md");
    assert(readmeInfo.isFile);
    assert(!readmeInfo.isSymlink);

    const modulesInfo = Edno.statSync("tests/testdata/symlink_to_subdir");
    assert(modulesInfo.isDirectory);
    assert(!modulesInfo.isSymlink);

    const testsInfo = Edno.statSync("tests");
    assert(testsInfo.isDirectory);
    assert(!testsInfo.isSymlink);

    const tempFile = Edno.makeTempFileSync();
    const tempInfo = Edno.statSync(tempFile);
    const now = Date.now();
    assert(tempInfo.atime !== null && now - tempInfo.atime.valueOf() < 60_000);
    assert(tempInfo.mtime !== null && now - tempInfo.mtime.valueOf() < 60_000);
    assert(tempInfo.ctime !== null && now - tempInfo.ctime.valueOf() < 60_000);
    const mode = tempInfo.mode! & 0o777;
    if (Edno.build.os === "windows") {
      assertEquals(mode, 0o666);
    } else {
      assertEquals(mode, 0o600);
    }

    const readmeInfoByUrl = Edno.statSync(pathToAbsoluteFileUrl("README.md"));
    assert(readmeInfoByUrl.isFile);
    assert(!readmeInfoByUrl.isSymlink);

    const modulesInfoByUrl = Edno.statSync(
      pathToAbsoluteFileUrl("tests/testdata/symlink_to_subdir"),
    );
    assert(modulesInfoByUrl.isDirectory);
    assert(!modulesInfoByUrl.isSymlink);

    const testsInfoByUrl = Edno.statSync(pathToAbsoluteFileUrl("tests"));
    assert(testsInfoByUrl.isDirectory);
    assert(!testsInfoByUrl.isSymlink);

    const tempFileForUrl = Edno.makeTempFileSync();
    const tempInfoByUrl = Edno.statSync(
      new URL(
        `file://${Edno.build.os === "windows" ? "/" : ""}${tempFileForUrl}`,
      ),
    );
    assert(tempInfoByUrl.atime !== null);
    assert(tempInfoByUrl.mtime !== null);
    assert(tempInfoByUrl.ctime !== null);

    Edno.removeSync(tempFile, { recursive: true });
    Edno.removeSync(tempFileForUrl, { recursive: true });
  },
);

Edno.test({ permissions: { read: false } }, function statSyncPerm() {
  assertThrows(() => {
    Edno.statSync("README.md");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { read: true } }, function statSyncNotFound() {
  assertThrows(
    () => {
      Edno.statSync("bad_file_name");
    },
    Edno.errors.NotFound,
    `stat 'bad_file_name'`,
  );
});

Edno.test({ permissions: { read: true } }, function lstatSyncSuccess() {
  const packageInfo = Edno.lstatSync("README.md");
  assert(packageInfo.isFile);
  assert(!packageInfo.isSymlink);

  const packageInfoByUrl = Edno.lstatSync(pathToAbsoluteFileUrl("README.md"));
  assert(packageInfoByUrl.isFile);
  assert(!packageInfoByUrl.isSymlink);

  const modulesInfo = Edno.lstatSync("tests/testdata/symlink_to_subdir");
  assert(!modulesInfo.isDirectory);
  assert(modulesInfo.isSymlink);

  const modulesInfoByUrl = Edno.lstatSync(
    pathToAbsoluteFileUrl("tests/testdata/symlink_to_subdir"),
  );
  assert(!modulesInfoByUrl.isDirectory);
  assert(modulesInfoByUrl.isSymlink);

  const coreInfo = Edno.lstatSync("cli");
  assert(coreInfo.isDirectory);
  assert(!coreInfo.isSymlink);

  const coreInfoByUrl = Edno.lstatSync(pathToAbsoluteFileUrl("cli"));
  assert(coreInfoByUrl.isDirectory);
  assert(!coreInfoByUrl.isSymlink);
});

Edno.test({ permissions: { read: false } }, function lstatSyncPerm() {
  assertThrows(() => {
    Edno.lstatSync("assets/hello.txt");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { read: true } }, function lstatSyncNotFound() {
  assertThrows(
    () => {
      Edno.lstatSync("bad_file_name");
    },
    Edno.errors.NotFound,
    `stat 'bad_file_name'`,
  );
});

Edno.test(
  { permissions: { read: true, write: true } },
  async function statSuccess() {
    const readmeInfo = await Edno.stat("README.md");
    assert(readmeInfo.isFile);
    assert(!readmeInfo.isSymlink);

    const readmeInfoByUrl = await Edno.stat(
      pathToAbsoluteFileUrl("README.md"),
    );
    assert(readmeInfoByUrl.isFile);
    assert(!readmeInfoByUrl.isSymlink);

    const modulesInfo = await Edno.stat("tests/testdata/symlink_to_subdir");
    assert(modulesInfo.isDirectory);
    assert(!modulesInfo.isSymlink);

    const modulesInfoByUrl = await Edno.stat(
      pathToAbsoluteFileUrl("tests/testdata/symlink_to_subdir"),
    );
    assert(modulesInfoByUrl.isDirectory);
    assert(!modulesInfoByUrl.isSymlink);

    const testsInfo = await Edno.stat("tests");
    assert(testsInfo.isDirectory);
    assert(!testsInfo.isSymlink);

    const testsInfoByUrl = await Edno.stat(pathToAbsoluteFileUrl("tests"));
    assert(testsInfoByUrl.isDirectory);
    assert(!testsInfoByUrl.isSymlink);

    const tempFile = await Edno.makeTempFile();
    const tempInfo = await Edno.stat(tempFile);
    assert(tempInfo.atime !== null);
    assert(tempInfo.mtime !== null);
    assert(tempInfo.ctime !== null);

    const tempFileForUrl = await Edno.makeTempFile();
    const tempInfoByUrl = await Edno.stat(
      new URL(
        `file://${Edno.build.os === "windows" ? "/" : ""}${tempFileForUrl}`,
      ),
    );
    assert(tempInfoByUrl.atime !== null);
    assert(tempInfoByUrl.mtime !== null);
    assert(tempInfoByUrl.ctime !== null);
    Edno.removeSync(tempFile, { recursive: true });
    Edno.removeSync(tempFileForUrl, { recursive: true });
  },
);

Edno.test({ permissions: { read: false } }, async function statPerm() {
  await assertRejects(async () => {
    await Edno.stat("README.md");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { read: true } }, async function statNotFound() {
  await assertRejects(
    async () => {
      await Edno.stat("bad_file_name");
    },
    Edno.errors.NotFound,
    `stat 'bad_file_name'`,
  );
});

Edno.test({ permissions: { read: true } }, async function lstatSuccess() {
  const readmeInfo = await Edno.lstat("README.md");
  assert(readmeInfo.isFile);
  assert(!readmeInfo.isSymlink);

  const readmeInfoByUrl = await Edno.lstat(pathToAbsoluteFileUrl("README.md"));
  assert(readmeInfoByUrl.isFile);
  assert(!readmeInfoByUrl.isSymlink);

  const modulesInfo = await Edno.lstat("tests/testdata/symlink_to_subdir");
  assert(!modulesInfo.isDirectory);
  assert(modulesInfo.isSymlink);

  const modulesInfoByUrl = await Edno.lstat(
    pathToAbsoluteFileUrl("tests/testdata/symlink_to_subdir"),
  );
  assert(!modulesInfoByUrl.isDirectory);
  assert(modulesInfoByUrl.isSymlink);

  const coreInfo = await Edno.lstat("cli");
  assert(coreInfo.isDirectory);
  assert(!coreInfo.isSymlink);

  const coreInfoByUrl = await Edno.lstat(pathToAbsoluteFileUrl("cli"));
  assert(coreInfoByUrl.isDirectory);
  assert(!coreInfoByUrl.isSymlink);
});

Edno.test({ permissions: { read: false } }, async function lstatPerm() {
  await assertRejects(async () => {
    await Edno.lstat("README.md");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { read: true } }, async function lstatNotFound() {
  await assertRejects(
    async () => {
      await Edno.lstat("bad_file_name");
    },
    Edno.errors.NotFound,
    `stat 'bad_file_name'`,
  );
});

Edno.test(
  {
    ignore: Edno.build.os !== "windows",
    permissions: { read: true, write: true },
  },
  function statNoUnixFields() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Edno.makeTempDirSync();
    const filename = tempDir + "/test.txt";
    Edno.writeFileSync(filename, data, { mode: 0o666 });
    const s = Edno.statSync(filename);
    assert(s.dev !== 0);
    assert(s.ino !== null);
    assert(s.nlink !== null);
    assert(s.uid === null);
    assert(s.gid === null);
    assert(s.rdev === null);
    assert(s.blksize === null);
    assert(s.blocks !== null);
    assert(s.isBlockDevice === null);
    assert(s.isCharDevice === null);
    assert(s.isFifo === null);
    assert(s.isSocket === null);
  },
);

Edno.test(
  {
    ignore: Edno.build.os === "windows",
    permissions: { read: true, write: true },
  },
  function statUnixFields() {
    const enc = new TextEncoder();
    const data = enc.encode("Hello");
    const tempDir = Edno.makeTempDirSync();
    const filename = tempDir + "/test.txt";
    const filename2 = tempDir + "/test2.txt";
    Edno.writeFileSync(filename, data, { mode: 0o666 });
    // Create a link
    Edno.linkSync(filename, filename2);
    const s = Edno.statSync(filename);
    assert(s.dev !== null);
    assert(s.ino !== null);
    assertEquals(s.mode! & 0o666, 0o666);
    assertEquals(s.nlink, 2);
    assert(s.uid !== null);
    assert(s.gid !== null);
    assert(s.rdev !== null);
    assert(s.blksize !== null);
    assert(s.blocks !== null);
    assert(!s.isBlockDevice);
    assert(!s.isCharDevice);
    assert(!s.isFifo);
    assert(!s.isSocket);
  },
);

Edno.test(
  { permissions: { read: false, write: true } },
  async function fsFileStatFailPermissions() {
    const testDir = Edno.makeTempDirSync();
    const filename = testDir + "/file.txt";
    using file = await Edno.open(filename, {
      read: false,
      write: true,
      create: true,
    });

    await assertRejects(
      () => file.stat(),
      Edno.errors.NotCapable,
      "Requires read access to",
    );
    assertThrows(
      () => file.statSync(),
      Edno.errors.NotCapable,
      "Requires read access to",
    );
  },
);

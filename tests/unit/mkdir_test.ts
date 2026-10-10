// Copyright 2018-2026 the Deno authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

function assertDirectory(path: string, mode?: number) {
  const info = Edno.lstatSync(path);
  assert(info.isDirectory);
  if (Edno.build.os !== "windows" && mode !== undefined) {
    assertEquals(info.mode! & 0o777, mode & ~Edno.umask());
  }
}

Edno.test(
  { permissions: { read: true, write: true } },
  function mkdirSyncSuccess() {
    const path = Edno.makeTempDirSync() + "/dir";
    Edno.mkdirSync(path);
    assertDirectory(path);
  },
);

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function mkdirSyncMode() {
    const path = Edno.makeTempDirSync() + "/dir";
    Edno.mkdirSync(path, { mode: 0o737 });
    assertDirectory(path, 0o737);
  },
);

Edno.test({ permissions: { write: false } }, function mkdirSyncPerm() {
  assertThrows(() => {
    Edno.mkdirSync("/baddir");
  }, Edno.errors.NotCapable);
});

Edno.test(
  { permissions: { read: true, write: true } },
  async function mkdirSuccess() {
    const path = Edno.makeTempDirSync() + "/dir";
    await Edno.mkdir(path);
    assertDirectory(path);
  },
);

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function mkdirMode() {
    const path = Edno.makeTempDirSync() + "/dir";
    await Edno.mkdir(path, { mode: 0o737 });
    assertDirectory(path, 0o737);
  },
);

Edno.test({ permissions: { write: true } }, function mkdirErrSyncIfExists() {
  assertThrows(
    () => {
      Edno.mkdirSync(".");
    },
    Edno.errors.AlreadyExists,
    `mkdir '.'`,
  );
});

Edno.test({ permissions: { write: true } }, async function mkdirErrIfExists() {
  await assertRejects(
    async () => {
      await Edno.mkdir(".");
    },
    Edno.errors.AlreadyExists,
    `mkdir '.'`,
  );
});

Edno.test(
  { permissions: { read: true, write: true } },
  function mkdirSyncRecursive() {
    const path = Edno.makeTempDirSync() + "/nested/directory";
    Edno.mkdirSync(path, { recursive: true });
    assertDirectory(path);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function mkdirRecursive() {
    const path = Edno.makeTempDirSync() + "/nested/directory";
    await Edno.mkdir(path, { recursive: true });
    assertDirectory(path);
  },
);

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function mkdirSyncRecursiveMode() {
    const nested = Edno.makeTempDirSync() + "/nested";
    const path = nested + "/dir";
    Edno.mkdirSync(path, { mode: 0o737, recursive: true });
    assertDirectory(path, 0o737);
    assertDirectory(nested, 0o737);
  },
);

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function mkdirRecursiveMode() {
    const nested = Edno.makeTempDirSync() + "/nested";
    const path = nested + "/dir";
    await Edno.mkdir(path, { mode: 0o737, recursive: true });
    assertDirectory(path, 0o737);
    assertDirectory(nested, 0o737);
  },
);

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  function mkdirSyncRecursiveIfExists() {
    const path = Edno.makeTempDirSync() + "/dir";
    Edno.mkdirSync(path, { mode: 0o737 });
    Edno.mkdirSync(path, { recursive: true });
    Edno.mkdirSync(path, { recursive: true, mode: 0o731 });
    assertDirectory(path, 0o737);
    if (Edno.build.os !== "windows") {
      const pathLink = path + "Link";
      Edno.symlinkSync(path, pathLink);
      Edno.mkdirSync(pathLink, { recursive: true });
      Edno.mkdirSync(pathLink, { recursive: true, mode: 0o731 });
      assertDirectory(path, 0o737);
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true, sys: ["umask"] } },
  async function mkdirRecursiveIfExists() {
    const path = Edno.makeTempDirSync() + "/dir";
    await Edno.mkdir(path, { mode: 0o737 });
    await Edno.mkdir(path, { recursive: true });
    await Edno.mkdir(path, { recursive: true, mode: 0o731 });
    assertDirectory(path, 0o737);
    if (Edno.build.os !== "windows") {
      const pathLink = path + "Link";
      Edno.symlinkSync(path, pathLink);
      await Edno.mkdir(pathLink, { recursive: true });
      await Edno.mkdir(pathLink, { recursive: true, mode: 0o731 });
      assertDirectory(path, 0o737);
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function mkdirSyncErrors() {
    const testDir = Edno.makeTempDirSync();
    const emptydir = testDir + "/empty";
    const fulldir = testDir + "/dir";
    const file = fulldir + "/file";
    Edno.mkdirSync(emptydir);
    Edno.mkdirSync(fulldir);
    Edno.createSync(file).close();

    assertThrows(() => {
      Edno.mkdirSync(emptydir, { recursive: false });
    }, Edno.errors.AlreadyExists);
    assertThrows(() => {
      Edno.mkdirSync(fulldir, { recursive: false });
    }, Edno.errors.AlreadyExists);
    assertThrows(() => {
      Edno.mkdirSync(file, { recursive: false });
    }, Edno.errors.AlreadyExists);
    assertThrows(() => {
      Edno.mkdirSync(file, { recursive: true });
    }, Edno.errors.AlreadyExists);

    if (Edno.build.os !== "windows") {
      const fileLink = testDir + "/fileLink";
      const dirLink = testDir + "/dirLink";
      const danglingLink = testDir + "/danglingLink";
      Edno.symlinkSync(file, fileLink);
      Edno.symlinkSync(emptydir, dirLink);
      Edno.symlinkSync(testDir + "/nonexistent", danglingLink);

      assertThrows(() => {
        Edno.mkdirSync(dirLink, { recursive: false });
      }, Edno.errors.AlreadyExists);
      assertThrows(() => {
        Edno.mkdirSync(fileLink, { recursive: false });
      }, Edno.errors.AlreadyExists);
      assertThrows(() => {
        Edno.mkdirSync(fileLink, { recursive: true });
      }, Edno.errors.AlreadyExists);
      assertThrows(() => {
        Edno.mkdirSync(danglingLink, { recursive: false });
      }, Edno.errors.AlreadyExists);
      assertThrows(() => {
        Edno.mkdirSync(danglingLink, { recursive: true });
      }, Edno.errors.AlreadyExists);
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function mkdirSyncRelativeUrlPath() {
    const testDir = Edno.makeTempDirSync();
    const nestedDir = testDir + "/nested";
    // Add trailing slash so base path is treated as a directory. pathToAbsoluteFileUrl removes trailing slashes.
    const path = new URL("../dir", pathToAbsoluteFileUrl(nestedDir) + "/");

    Edno.mkdirSync(nestedDir);
    Edno.mkdirSync(path);

    assertDirectory(testDir + "/dir");
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function mkdirRelativeUrlPath() {
    const testDir = Edno.makeTempDirSync();
    const nestedDir = testDir + "/nested";
    // Add trailing slash so base path is treated as a directory. pathToAbsoluteFileUrl removes trailing slashes.
    const path = new URL("../dir", pathToAbsoluteFileUrl(nestedDir) + "/");

    await Edno.mkdir(nestedDir);
    await Edno.mkdir(path);

    assertDirectory(testDir + "/dir");
  },
);

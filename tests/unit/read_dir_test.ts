// Copyright 2018-2026 the Deno authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  pathToAbsoluteFileUrl,
} from "./test_util.ts";

function assertSameContent(files: Edno.DirEntry[]) {
  let counter = 0;

  for (const entry of files) {
    if (entry.name === "subdir") {
      assert(entry.isDirectory);
      counter++;
    }
  }

  assertEquals(counter, 1);
}

Edno.test({ permissions: { read: true } }, function readDirSyncSuccess() {
  const files = [...Edno.readDirSync("tests/testdata")];
  assertSameContent(files);
});

Edno.test(
  { permissions: { read: true } },
  function readDirSyncResultHasIteratorHelperMethods() {
    const iterator = Edno.readDirSync("tests/testdata");
    assertEquals(typeof iterator.map, "function");
  },
);

Edno.test({ permissions: { read: true } }, function readDirSyncWithUrl() {
  const files = [
    ...Edno.readDirSync(pathToAbsoluteFileUrl("tests/testdata")),
  ];
  assertSameContent(files);
});

Edno.test({ permissions: { read: false } }, function readDirSyncPerm() {
  assertThrows(() => {
    Edno.readDirSync("tests/");
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { read: true } }, function readDirSyncNotDir() {
  assertThrows(
    () => {
      Edno.readDirSync("tests/testdata/assets/fixture.json");
    },
    Error,
    `readdir 'tests/testdata/assets/fixture.json'`,
  );
});

Edno.test({ permissions: { read: true } }, function readDirSyncNotFound() {
  assertThrows(
    () => {
      Edno.readDirSync("bad_dir_name");
    },
    Edno.errors.NotFound,
    `readdir 'bad_dir_name'`,
  );
});

Edno.test({ permissions: { read: true } }, async function readDirSuccess() {
  const files = [];
  for await (const dirEntry of Edno.readDir("tests/testdata")) {
    files.push(dirEntry);
  }
  assertSameContent(files);
});

Edno.test({ permissions: { read: true } }, async function readDirWithUrl() {
  const files = [];
  for await (
    const dirEntry of Edno.readDir(pathToAbsoluteFileUrl("tests/testdata"))
  ) {
    files.push(dirEntry);
  }
  assertSameContent(files);
});

Edno.test(
  { permissions: { read: true } },
  async function readDirIterableCreatesIndependentIterators() {
    const dir = Edno.readDir("tests/testdata");
    const [filesA, filesB] = await Promise.all([
      Array.fromAsync(dir),
      Array.fromAsync(dir),
    ]);

    assertSameContent(filesA);
    assertSameContent(filesB);
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  async function readDirConcurrentNextRejectsWithBusy() {
    const tempDir = await Edno.makeTempDir();
    try {
      await Promise.all(
        Array.from(
          { length: 64 },
          (_, index) => Edno.writeTextFile(`${tempDir}/${index}.txt`, ""),
        ),
      );
      const iterator = Edno.readDir(tempDir)[Symbol.asyncIterator]();

      await assertRejects(
        async () => {
          await Promise.all(
            Array.from({ length: 64 }, () => iterator.next()),
          );
        },
        Edno.errors.Busy,
      );
      await iterator.return?.();
    } finally {
      await Edno.remove(tempDir, { recursive: true });
    }
  },
);

Edno.test({ permissions: { read: false } }, async function readDirPerm() {
  await assertRejects(async () => {
    await Edno.readDir("tests/")[Symbol.asyncIterator]().next();
  }, Edno.errors.NotCapable);
});

Edno.test(
  { permissions: "inherit", ignore: Edno.build.os == "windows" },
  async function readDirDevFd(): Promise<
    void
  > {
    for await (const _ of Edno.readDir("/dev/fd")) {
      // We don't actually care whats in here; just that we don't panic on non regular entries
    }
  },
);

Edno.test(
  { permissions: "inherit", ignore: Edno.build.os == "windows" },
  function readDirDevFdSync() {
    for (const _ of Edno.readDirSync("/dev/fd")) {
      // We don't actually care whats in here; just that we don't panic on non regular file entries
    }
  },
);

Edno.test({ permissions: { read: true } }, async function readDirNotFound() {
  await assertRejects(
    async () => {
      await Edno.readDir("bad_dir_name")[Symbol.asyncIterator]().next();
    },
    Edno.errors.NotFound,
    `readdir 'bad_dir_name'`,
  );
});

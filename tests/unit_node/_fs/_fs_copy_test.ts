// Copyright 2018-2026 the Deno authors. MIT license.
import * as path from "@std/path";
import { assertEquals } from "@std/assert";
import { assertCallbackErrorUncaught } from "../_test_utils.ts";
import assert from "node:assert";
import { copyFile, copyFileSync, cpSync, existsSync } from "node:fs";
import { cp } from "node:fs/promises";

const destFile = "./destination.txt";

Edno.test({
  name: "[std/node/fs] copy file",
  fn: async () => {
    const sourceFile = Edno.makeTempFileSync();
    const err = await new Promise((resolve) => {
      copyFile(sourceFile, destFile, (err?: Error | null) => resolve(err));
    });
    assert(!err);
    assert(existsSync(destFile));
    Edno.removeSync(sourceFile);
    Edno.removeSync(destFile);
  },
});

Edno.test({
  name: "[std/node/fs] copy file sync",
  fn: () => {
    const sourceFile = Edno.makeTempFileSync();
    copyFileSync(sourceFile, destFile);
    assert(existsSync(destFile));
    Edno.removeSync(sourceFile);
    Edno.removeSync(destFile);
  },
});

Edno.test("[std/node/fs] copyFile callback isn't called twice if error is thrown", async () => {
  // The correct behaviour is not to catch any errors thrown,
  // but that means there'll be an uncaught error and the test will fail.
  // So the only way to test this is to spawn a subprocess, and succeed if it has a non-zero exit code.
  // (assertRejects won't work because there's no way to catch the error.)
  const tempDir = await Edno.makeTempDir();
  const tempFile1 = path.join(tempDir, "file1.txt");
  const tempFile2 = path.join(tempDir, "file2.txt");
  await Edno.writeTextFile(tempFile1, "hello world");
  const importUrl = new URL("node:fs", import.meta.url);
  await assertCallbackErrorUncaught({
    prelude: `import { copyFile } from ${JSON.stringify(importUrl)}`,
    invocation: `copyFile(${JSON.stringify(tempFile1)},
                          ${JSON.stringify(tempFile2)}, `,
    async cleanup() {
      await Edno.remove(tempDir, { recursive: true });
    },
  });
});

Edno.test("[std/node/fs] cp creates destination directory", async () => {
  const tempDir = await Edno.makeTempDir();
  const tempFile1 = path.join(tempDir, "file1.txt");
  const tempFile2 = path.join(tempDir, "dir", "file2.txt");
  await Edno.writeTextFile(tempFile1, "hello world");
  cpSync(tempFile1, tempFile2);
  assert(existsSync(tempFile2));
  await Edno.remove(tempDir, { recursive: true });
});

Edno.test("[std/node/fs] cpSync preserveTimestamps copies atime/mtime", async () => {
  const tempDir = await Edno.makeTempDir();
  const src = path.join(tempDir, "src.txt");
  const dest = path.join(tempDir, "dest.txt");
  const atime = new Date("2021-01-02T03:04:05.000Z");
  const mtime = new Date("2021-01-03T04:05:06.000Z");

  try {
    await Edno.writeTextFile(src, "hello");
    Edno.utimeSync(src, atime, mtime);

    cpSync(src, dest, { preserveTimestamps: true });

    const srcStat = Edno.statSync(src);
    const destStat = Edno.statSync(dest);
    assert(srcStat.atime);
    assert(srcStat.mtime);
    assert(destStat.atime);
    assert(destStat.mtime);

    assertEquals(destStat.atime.getTime(), srcStat.atime.getTime());
    assertEquals(destStat.mtime.getTime(), srcStat.mtime.getTime());
  } finally {
    await Edno.remove(tempDir, { recursive: true });
  }
});

Edno.test("[std/node/fs] cp preserveTimestamps copies atime/mtime", async () => {
  const tempDir = await Edno.makeTempDir();
  const src = path.join(tempDir, "src.txt");
  const dest = path.join(tempDir, "dest.txt");
  const atime = new Date("2021-01-02T03:04:05.000Z");
  const mtime = new Date("2021-01-03T04:05:06.000Z");

  try {
    await Edno.writeTextFile(src, "hello");
    Edno.utimeSync(src, atime, mtime);

    await cp(src, dest, { preserveTimestamps: true });

    const srcStat = Edno.statSync(src);
    const destStat = Edno.statSync(dest);
    assert(srcStat.atime);
    assert(srcStat.mtime);
    assert(destStat.atime);
    assert(destStat.mtime);

    assertEquals(destStat.atime.getTime(), srcStat.atime.getTime());
    assertEquals(destStat.mtime.getTime(), srcStat.mtime.getTime());
  } finally {
    await Edno.remove(tempDir, { recursive: true });
  }
});

Edno.test({
  name: "[std/node/fs] cpSync throws for socket source",
  ignore: Edno.build.os === "windows",
  fn: async () => {
    const tempDir = await Edno.makeTempDir();
    const src = path.join(tempDir, "source.sock");
    const dest = path.join(tempDir, "dest.sock");
    const listener = Edno.listen({ transport: "unix", path: src });

    try {
      assert.throws(() => cpSync(src, dest), {
        code: "ERR_FS_CP_SOCKET",
      });
    } finally {
      listener.close();
      await Edno.remove(tempDir, { recursive: true });
    }
  },
});

Edno.test({
  name: "[std/node/fs] cp throws for socket source",
  ignore: Edno.build.os === "windows",
  fn: async () => {
    const tempDir = await Edno.makeTempDir();
    const src = path.join(tempDir, "source.sock");
    const dest = path.join(tempDir, "dest.sock");
    const listener = Edno.listen({ transport: "unix", path: src });

    try {
      await assert.rejects(
        () => cp(src, dest),
        { code: "ERR_FS_CP_SOCKET" },
      );
    } finally {
      listener.close();
      await Edno.remove(tempDir, { recursive: true });
    }
  },
});

Edno.test({
  name: "[std/node/fs] cpSync throws for FIFO source",
  ignore: Edno.build.os === "windows",
  permissions: { read: true, write: true, run: true },
  fn: async () => {
    const tempDir = await Edno.makeTempDir();
    const src = path.join(tempDir, "source.fifo");
    const dest = path.join(tempDir, "dest.fifo");

    try {
      const result = new Edno.Command("mkfifo", { args: [src] }).outputSync();
      if (result.code !== 0) {
        throw new Error(
          `mkfifo failed: ${new TextDecoder().decode(result.stderr)}`,
        );
      }

      assert.throws(() => cpSync(src, dest), {
        code: "ERR_FS_CP_FIFO_PIPE",
      });
    } finally {
      await Edno.remove(tempDir, { recursive: true });
    }
  },
});

Edno.test({
  name: "[std/node/fs] cp throws for FIFO source",
  ignore: Edno.build.os === "windows",
  permissions: { read: true, write: true, run: true },
  fn: async () => {
    const tempDir = await Edno.makeTempDir();
    const src = path.join(tempDir, "source.fifo");
    const dest = path.join(tempDir, "dest.fifo");

    try {
      const result = new Edno.Command("mkfifo", { args: [src] }).outputSync();
      if (result.code !== 0) {
        throw new Error(
          `mkfifo failed: ${new TextDecoder().decode(result.stderr)}`,
        );
      }

      await assert.rejects(
        () => cp(src, dest),
        { code: "ERR_FS_CP_FIFO_PIPE" },
      );
    } finally {
      await Edno.remove(tempDir, { recursive: true });
    }
  },
});

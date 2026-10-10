// Copyright 2018-2026 the Deno authors. MIT license.
import { assert, assertEquals, fail } from "@std/assert";
import { assertCallbackErrorUncaught } from "../_test_utils.ts";
import { Dir as DirOrig, type Dirent } from "node:fs";

// edno-lint-ignore no-explicit-any
const Dir = DirOrig as any;

Edno.test({
  name: "Closing current directory with callback is successful",
  fn() {
    let calledBack = false;
    // edno-lint-ignore no-explicit-any
    new Dir(".").close((valOrErr: any) => {
      assert(!valOrErr);
      calledBack = true;
    });
    assert(calledBack);
  },
});

Edno.test({
  name: "Closing current directory without callback returns void Promise",
  async fn() {
    await new Dir(".").close();
  },
});

Edno.test({
  name: "Closing current directory synchronously works",
  fn() {
    new Dir(".").closeSync();
  },
});

Edno.test({
  name: "Path is correctly returned",
  fn() {
    assertEquals(new Dir("std/node").path, "std/node");

    const enc: Uint8Array = new TextEncoder().encode("std/node");
    assertEquals(new Dir(enc).path, "std/node");
  },
});

Edno.test({
  name: "read returns null for empty directory",
  async fn() {
    const testDir: string = Edno.makeTempDirSync();
    try {
      const file: Dirent | null = await new Dir(testDir).read();
      assert(file === null);

      let calledBack = false;
      const fileFromCallback: Dirent | null = await new Dir(
        testDir,
        // edno-lint-ignore no-explicit-any
      ).read((err: any, res: Dirent) => {
        assert(res === null);
        assert(err === null);
        calledBack = true;
      });
      assert(fileFromCallback === null);
      assert(calledBack);

      assertEquals(new Dir(testDir).readSync(), null);
    } finally {
      Edno.removeSync(testDir);
    }
  },
});

Edno.test({
  name: "Async read returns one file at a time",
  async fn() {
    const testDir: string = Edno.makeTempDirSync();
    const f1 = Edno.createSync(testDir + "/foo.txt");
    f1.close();
    const f2 = Edno.createSync(testDir + "/bar.txt");
    f2.close();

    try {
      let secondCallback = false;
      const dir = new Dir(testDir);
      const firstRead: Dirent | null = await dir.read();
      const secondRead: Dirent | null = await dir.read(
        // edno-lint-ignore no-explicit-any
        (_err: any, secondResult: Dirent) => {
          assert(
            secondResult.name === "bar.txt" || secondResult.name === "foo.txt",
          );
          secondCallback = true;
        },
      );
      const thirdRead: Dirent | null = await dir.read();
      const fourthRead: Dirent | null = await dir.read();

      if (firstRead?.name === "foo.txt") {
        assertEquals(secondRead?.name, "bar.txt");
      } else if (firstRead?.name === "bar.txt") {
        assertEquals(secondRead?.name, "foo.txt");
      } else {
        fail("File not found during read");
      }
      assert(secondCallback);
      assert(thirdRead === null);
      assert(fourthRead === null);
    } finally {
      Edno.removeSync(testDir, { recursive: true });
    }
  },
});

Edno.test({
  name: "Sync read returns one file at a time",
  fn() {
    const testDir: string = Edno.makeTempDirSync();
    const f1 = Edno.createSync(testDir + "/foo.txt");
    f1.close();
    const f2 = Edno.createSync(testDir + "/bar.txt");
    f2.close();

    try {
      const dir = new Dir(testDir);
      const firstRead: Dirent | null = dir.readSync();
      const secondRead: Dirent | null = dir.readSync();
      const thirdRead: Dirent | null = dir.readSync();
      const fourthRead: Dirent | null = dir.readSync();

      if (firstRead?.name === "foo.txt") {
        assertEquals(secondRead?.name, "bar.txt");
      } else if (firstRead?.name === "bar.txt") {
        assertEquals(secondRead?.name, "foo.txt");
      } else {
        fail("File not found during read");
      }
      assert(thirdRead === null);
      assert(fourthRead === null);
    } finally {
      Edno.removeSync(testDir, { recursive: true });
    }
  },
});

Edno.test({
  name: "Async iteration over existing directory",
  async fn() {
    const testDir: string = Edno.makeTempDirSync();
    const f1 = Edno.createSync(testDir + "/foo.txt");
    f1.close();
    const f2 = Edno.createSync(testDir + "/bar.txt");
    f2.close();

    try {
      const dir = new Dir(testDir);
      const results: Array<string | null> = [];

      for await (const file of dir[Symbol.asyncIterator]()) {
        results.push(file.name);
      }

      assert(results.length === 2);
      assert(results.includes("foo.txt"));
      assert(results.includes("bar.txt"));
    } finally {
      Edno.removeSync(testDir, { recursive: true });
    }
  },
});

Edno.test(
  "[std/node/fs] Dir.close callback isn't called twice if error is thrown",
  async () => {
    const tempDir = await Edno.makeTempDir();
    await assertCallbackErrorUncaught({
      prelude: `
    import { Dir } from "node:fs";

    const dir = new Dir(${JSON.stringify(tempDir)});
    `,
      invocation: "dir.close(",
      async cleanup() {
        await Edno.remove(tempDir);
      },
    });
  },
);

Edno.test(
  "[std/node/fs] Dir.read callback isn't called twice if error is thrown",
  async () => {
    const tempDir = await Edno.makeTempDir();
    await assertCallbackErrorUncaught({
      prelude: `
    import { Dir } from "node:fs";

    const dir = new Dir(${JSON.stringify(tempDir)});
    `,
      invocation: "dir.read(",
      async cleanup() {
        await Edno.remove(tempDir);
      },
    });
  },
);

Edno.test({
  name: "Dir.readSync throws ERR_DIR_CLOSED after closeSync",
  fn() {
    const testDir: string = Edno.makeTempDirSync();
    try {
      const dir = new Dir(testDir);
      dir.closeSync();
      try {
        dir.readSync();
        fail("Expected ERR_DIR_CLOSED to be thrown");
      } catch (e) {
        // edno-lint-ignore no-explicit-any
        assertEquals((e as any).code, "ERR_DIR_CLOSED");
      }
    } finally {
      Edno.removeSync(testDir, { recursive: true });
    }
  },
});

Edno.test({
  name: "Dir.read rejects with ERR_DIR_CLOSED after close",
  async fn() {
    const testDir: string = Edno.makeTempDirSync();
    try {
      const dir = new Dir(testDir);
      await dir.close();
      try {
        await dir.read();
        fail("Expected ERR_DIR_CLOSED to be thrown");
      } catch (e) {
        // edno-lint-ignore no-explicit-any
        assertEquals((e as any).code, "ERR_DIR_CLOSED");
      }
    } finally {
      Edno.removeSync(testDir, { recursive: true });
    }
  },
});

Edno.test({
  name: "Dir.readSync throws ERR_DIR_CLOSED after async close",
  async fn() {
    const testDir: string = Edno.makeTempDirSync();
    try {
      const dir = new Dir(testDir);
      await dir.close();
      try {
        dir.readSync();
        fail("Expected ERR_DIR_CLOSED to be thrown");
      } catch (e) {
        // edno-lint-ignore no-explicit-any
        assertEquals((e as any).code, "ERR_DIR_CLOSED");
      }
    } finally {
      Edno.removeSync(testDir, { recursive: true });
    }
  },
});

Edno.test({
  name: "Dir.read callback receives ERR_DIR_CLOSED after close",
  async fn() {
    const testDir: string = Edno.makeTempDirSync();
    try {
      const dir = new Dir(testDir);
      await dir.close();
      await new Promise<void>((resolve, reject) => {
        // edno-lint-ignore no-explicit-any
        dir.read((err: any) => {
          try {
            assertEquals(err.code, "ERR_DIR_CLOSED");
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    } finally {
      Edno.removeSync(testDir, { recursive: true });
    }
  },
});

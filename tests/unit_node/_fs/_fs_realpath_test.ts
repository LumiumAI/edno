// Copyright 2018-2026 the Deno authors. MIT license.
import * as path from "@std/path";
import { assertEquals } from "@std/assert";
import { assertCallbackErrorUncaught } from "../_test_utils.ts";
import { realpath, realpathSync } from "node:fs";

Edno.test("realpath", async function () {
  const tempFile = await Edno.makeTempFile();
  const tempFileAlias = tempFile + ".alias";
  await Edno.symlink(tempFile, tempFileAlias);
  const realPath = await new Promise((resolve, reject) => {
    realpath(tempFile, (err, path) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(path);
    });
  });
  const realSymLinkPath = await new Promise((resolve, reject) => {
    realpath(tempFileAlias, (err, path) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(path);
    });
  });
  assertEquals(realPath, realSymLinkPath);
});

Edno.test("realpathSync", function () {
  const tempFile = Edno.makeTempFileSync();
  const tempFileAlias = tempFile + ".alias";
  Edno.symlinkSync(tempFile, tempFileAlias);
  const realPath = realpathSync(tempFile);
  const realSymLinkPath = realpathSync(tempFileAlias);
  assertEquals(realPath, realSymLinkPath);
});

Edno.test("[std/node/fs] realpath callback isn't called twice if error is thrown", async () => {
  const tempDir = await Edno.makeTempDir();
  const tempFile = path.join(tempDir, "file.txt");
  const linkFile = path.join(tempDir, "link.txt");
  await Edno.writeTextFile(tempFile, "hello world");
  await Edno.symlink(tempFile, linkFile, { type: "file" });
  const importUrl = new URL("node:fs", import.meta.url);
  await assertCallbackErrorUncaught({
    prelude: `import { realpath } from ${JSON.stringify(importUrl)}`,
    invocation: `realpath(${JSON.stringify(`${tempDir}/link.txt`)}, `,
    async cleanup() {
      await Edno.remove(tempDir, { recursive: true });
    },
  });
});

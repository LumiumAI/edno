// Copyright 2018-2026 the Deno authors. MIT license.
import { assertEquals, assertThrows, fail } from "@std/assert";
import { truncate, truncateSync } from "node:fs";

Edno.test({
  name: "ASYNC: no callback function results in Error",
  fn() {
    assertThrows(
      () => {
        // @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'NoParamCallback'
        truncate("some/path", 0);
      },
      Error,
      "No callback function supplied",
    );
  },
});

Edno.test({
  name: "ASYNC: truncate entire file contents",
  async fn() {
    const file: string = Edno.makeTempFileSync();
    await Edno.writeTextFile(file, "hello world");

    await new Promise<void>((resolve, reject) => {
      truncate(file, (err: Error | null) => {
        if (err !== null) reject();
        else resolve();
      });
    })
      .then(
        () => {
          const fileInfo: Edno.FileInfo = Edno.lstatSync(file);
          assertEquals(fileInfo.size, 0);
        },
        () => {
          fail("No error expected");
        },
      )
      .finally(() => Edno.removeSync(file));
  },
});

Edno.test({
  name: "ASYNC: truncate file to a size of precisely len bytes",
  async fn() {
    const file: string = Edno.makeTempFileSync();
    await Edno.writeTextFile(file, "hello world");

    await new Promise<void>((resolve, reject) => {
      truncate(file, 3, (err: Error | null) => {
        if (err !== null) reject();
        else resolve();
      });
    })
      .then(
        () => {
          const fileInfo: Edno.FileInfo = Edno.lstatSync(file);
          assertEquals(fileInfo.size, 3);
        },
        () => {
          fail("No error expected");
        },
      )
      .finally(() => Edno.removeSync(file));
  },
});

Edno.test({
  name: "SYNC: truncate entire file contents",
  fn() {
    const file: string = Edno.makeTempFileSync();
    try {
      truncateSync(file);
      const fileInfo: Edno.FileInfo = Edno.lstatSync(file);
      assertEquals(fileInfo.size, 0);
    } finally {
      Edno.removeSync(file);
    }
  },
});

Edno.test({
  name: "SYNC: truncate file to a size of precisely len bytes",
  fn() {
    const file: string = Edno.makeTempFileSync();
    try {
      truncateSync(file, 3);
      const fileInfo: Edno.FileInfo = Edno.lstatSync(file);
      assertEquals(fileInfo.size, 3);
    } finally {
      Edno.removeSync(file);
    }
  },
});

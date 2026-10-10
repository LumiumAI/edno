// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals, assertStrictEquals } from "./test_util.ts";

Edno.test(function imageDataInitializedWithSourceWidthAndHeight() {
  const imageData = new ImageData(16, 9);

  assertStrictEquals(imageData.data.constructor, Uint8ClampedArray);
  assertEquals(imageData.data.length, 16 * 9 * 4); // width * height * 4 (RGBA pixels)
  assertEquals(imageData.width, 16);
  assertEquals(imageData.height, 9);
  assertEquals(imageData.pixelFormat, "rgba-unorm8");
  assertEquals(imageData.colorSpace, "srgb");
});

Edno.test(function imageDataInitializedWithImageDataAndWidth() {
  const data = new Uint8ClampedArray(16 * 9 * 4);
  const imageData = new ImageData(data, 16);

  assertStrictEquals(imageData.data, data);
  assertEquals(imageData.width, 16);
  assertEquals(imageData.height, 9);
  assertEquals(imageData.pixelFormat, "rgba-unorm8");
  assertEquals(imageData.colorSpace, "srgb");
});

Edno.test(
  function imageDataInitializedWithImageDataAndWidthAndHeightAndColorSpace() {
    const data = new Uint8ClampedArray(16 * 9 * 4);
    const imageData = new ImageData(data, 16, 9, {
      colorSpace: "display-p3",
    });

    assertStrictEquals(imageData.data, data);
    assertEquals(imageData.width, 16);
    assertEquals(imageData.height, 9);
    assertEquals(imageData.pixelFormat, "rgba-unorm8");
    assertEquals(imageData.colorSpace, "display-p3");
  },
);

Edno.test(
  function imageDataInitializedWithWidthAndHeightAndPixelFormatAndColorSpace() {
    const imageData = new ImageData(16, 9, {
      pixelFormat: "rgba-float16",
      colorSpace: "display-p3",
    });

    assertStrictEquals(imageData.data.constructor, Float16Array);
    assertEquals(imageData.data.length, 16 * 9 * 4); // width * height * 4 (RGBA pixels)
    assertEquals(imageData.width, 16);
    assertEquals(imageData.height, 9);
    assertEquals(imageData.pixelFormat, "rgba-float16");
    assertEquals(imageData.colorSpace, "display-p3");
  },
);

Edno.test(
  function imageDataInitializedWithImageDataAndWidthAndPixelFormat() {
    const data = new Float16Array(16 * 9 * 4);
    const imageData = new ImageData(data, 16, undefined, {
      pixelFormat: "rgba-float16",
    });

    assertStrictEquals(imageData.data, data);
    assertEquals(imageData.width, 16);
    assertEquals(imageData.height, 9);
    assertEquals(imageData.pixelFormat, "rgba-float16");
    assertEquals(imageData.colorSpace, "srgb");
  },
);

Edno.test(
  async function imageDataUsedInWorker() {
    const { promise, resolve } = Promise.withResolvers<void>();
    const url = import.meta.resolve(
      "../testdata/workers/image_data_worker.ts",
    );
    const expectedData = 16;

    const worker = new Worker(url, { type: "module" });
    worker.onmessage = function (e) {
      assertEquals(expectedData, e.data);
      worker.terminate();
      resolve();
    };

    await promise;
  },
);

// Copyright 2018-2026 the Deno authors. MIT license.

import {
  assertEquals,
  assertNotEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";

Edno.test({ permissions: { ffi: true } }, function dlopenInvalidArguments() {
  const filename = "/usr/lib/libc.so.6";
  assertThrows(() => {
    // @ts-expect-error: ForeignFunction cannot be null
    Edno.dlopen(filename, { malloc: null });
  }, TypeError);
  assertThrows(() => {
    Edno.dlopen(filename, {
      // @ts-expect-error: invalid NativeType
      malloc: { parameters: ["a"], result: "b" },
    });
  }, TypeError);
  assertThrows(() => {
    // @ts-expect-error: DynamicLibrary symbols cannot be null
    Edno.dlopen(filename, null);
  }, TypeError);
  assertThrows(() => {
    // @ts-expect-error: require 2 arguments
    Edno.dlopen(filename);
  }, TypeError);
});

Edno.test({ permissions: { ffi: false } }, function ffiNotCapable() {
  assertThrows(() => {
    Edno.dlopen("/usr/lib/libc.so.6", {});
  }, Edno.errors.NotCapable);
  const fnptr = new Edno.UnsafeFnPointer(
    // @ts-expect-error: Not NonNullable but null check is after permissions check.
    null,
    {
      parameters: ["u32", "pointer"],
      result: "void",
    } as const,
  );
  assertThrows(() => {
    fnptr.call(123, null);
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    Edno.UnsafePointer.of(new Uint8Array(0));
  }, Edno.errors.NotCapable);
  const ptrView = new Edno.UnsafePointerView(
    // @ts-expect-error: Not NonNullable but null check is after permissions check.
    null,
  );
  assertThrows(() => {
    ptrView.copyInto(new Uint8Array(0));
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    ptrView.getCString();
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    ptrView.getUint8();
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    ptrView.getInt8();
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    ptrView.getUint16();
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    ptrView.getInt16();
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    ptrView.getUint32();
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    ptrView.getInt32();
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    ptrView.getFloat32();
  }, Edno.errors.NotCapable);
  assertThrows(() => {
    ptrView.getFloat64();
  }, Edno.errors.NotCapable);
});

Edno.test({ permissions: { ffi: true } }, function pointerOf() {
  const buffer = new ArrayBuffer(1024);
  const baseAddress = Edno.UnsafePointer.value(Edno.UnsafePointer.of(buffer));
  const uint8Address = Edno.UnsafePointer.value(
    Edno.UnsafePointer.of(new Uint8Array(buffer)),
  );
  assertEquals(baseAddress, uint8Address);
  const float64Address = Edno.UnsafePointer.value(
    Edno.UnsafePointer.of(new Float64Array(buffer)),
  );
  assertEquals(baseAddress, float64Address);
  const uint8AddressOffset = Edno.UnsafePointer.value(
    Edno.UnsafePointer.of(new Uint8Array(buffer, 100)),
  );
  assertEquals(baseAddress + 100n, uint8AddressOffset);
  const float64AddressOffset = Edno.UnsafePointer.value(
    Edno.UnsafePointer.of(new Float64Array(buffer, 80)),
  );
  assertEquals(baseAddress + 80n, float64AddressOffset);
});

Edno.test(
  { permissions: { ffi: true } },
  function pointerOfSharedArrayBuffer() {
    const sab = new SharedArrayBuffer(1024);
    const baseAddress = Edno.UnsafePointer.value(Edno.UnsafePointer.of(sab));
    assertNotEquals(baseAddress, 0n);
    const uint8Address = Edno.UnsafePointer.value(
      Edno.UnsafePointer.of(new Uint8Array(sab)),
    );
    assertEquals(baseAddress, uint8Address);
    // An empty buffer resolves to the null pointer, matching the behavior of
    // an empty `ArrayBuffer`.
    assertEquals(Edno.UnsafePointer.of(new SharedArrayBuffer(0)), null);
    assertEquals(Edno.UnsafePointer.of(new ArrayBuffer(0)), null);
  },
);

Edno.test({ permissions: { ffi: true } }, function callWithError() {
  const throwCb = () => {
    throw new Error("Error");
  };
  const cb = new Edno.UnsafeCallback({
    parameters: [],
    result: "void",
  }, throwCb);
  const fnPointer = new Edno.UnsafeFnPointer(cb.pointer, {
    parameters: [],
    result: "void",
  });
  assertThrows(() => fnPointer.call());
  cb.close();
});

Edno.test(
  { permissions: { ffi: true }, ignore: true },
  async function callNonBlockingWithError() {
    const throwCb = () => {
      throw new Error("Error");
    };
    const cb = new Edno.UnsafeCallback({
      parameters: [],
      result: "void",
    }, throwCb);
    const fnPointer = new Edno.UnsafeFnPointer(cb.pointer, {
      parameters: [],
      result: "void",
      nonblocking: true,
    });
    // TODO(mmastrac): currently ignored as we do not thread callback exceptions through nonblocking pointers
    await assertRejects(async () => await fnPointer.call());
    cb.close();
  },
);

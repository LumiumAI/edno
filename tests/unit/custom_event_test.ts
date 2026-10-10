// Copyright 2018-2026 the Deno authors. MIT license.
import { assertEquals } from "./test_util.ts";

Edno.test(function customEventInitializedWithDetail() {
  const type = "touchstart";
  const detail = { message: "hello" };
  const customEventInit = {
    bubbles: true,
    cancelable: true,
    detail,
  } as CustomEventInit;
  const event = new CustomEvent(type, customEventInit);

  assertEquals(event.bubbles, true);
  assertEquals(event.cancelable, true);
  assertEquals(event.currentTarget, null);
  assertEquals(event.detail, detail);
  assertEquals(event.isTrusted, false);
  assertEquals(event.target, null);
  assertEquals(event.type, type);
});

Edno.test(function toStringShouldBeWebCompatibility() {
  const type = "touchstart";
  const event = new CustomEvent(type, {});
  assertEquals(event.toString(), "[object CustomEvent]");
});

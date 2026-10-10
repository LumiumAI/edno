function a() {
  // edno-lint-ignore no-explicit-any
  throw new Error("foo", { cause: new Error("bar", { cause: "edno" as any }) });
}

function b() {
  a();
}

function c() {
  b();
}

c();

Edno.test("foo", () => {
  throw undefined;
});

Edno.test("bar", () => {
  throw null;
});

Edno.test("baz", () => {
  throw 123;
});

Edno.test("qux", () => {
  throw "Hello, world!";
});

Edno.test("quux", () => {
  throw [1, 2, 3];
});

Edno.test("quuz", () => {
  throw { a: "Hello, world!", b: [1, 2, 3] };
});

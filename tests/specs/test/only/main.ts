Edno.test({
  name: "before",
  fn() {},
});

Edno.test({
  only: true,
  name: "only",
  fn() {},
});

Edno.test.only({
  name: "only2",
  fn() {},
});

Edno.test({
  name: "after",
  fn() {},
});

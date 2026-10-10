Edno.bench({
  name: "before",
  fn() {},
});

Edno.bench({
  only: true,
  name: "only",
  fn() {},
});

Edno.bench({
  name: "after",
  fn() {},
});

Edno.test({
  name: "success",
  fn() {},
});

Edno.test({
  name: "fail",
  fn() {
    throw new Error("fail");
  },
});

Edno.test({
  name: "ignored",
  ignore: true,
  fn() {},
});

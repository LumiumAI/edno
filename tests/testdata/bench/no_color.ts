Edno.bench({
  name: "success",
  fn() {},
});

Edno.bench({
  name: "success long",
  fn() {
    1024n ** 10000n;
  },
});

Edno.bench({
  name: "success but longer",
  fn() {
    1024n ** 1000000n;
  },
});

Edno.bench({
  name: "success long and the longest name",
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
});

Edno.bench({
  name: "fail",
  fn() {
    throw new Error("fail");
  },
});

Edno.bench({
  name: "ignored",
  ignore: true,
  fn() {},
});

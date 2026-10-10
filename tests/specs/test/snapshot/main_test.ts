Edno.test("basic object", async (t) => {
  await t.assertSnapshot({ hello: "world!", example: 123 });
});

Edno.test("multiple snapshots", async (t) => {
  await t.assertSnapshot("first");
  await t.assertSnapshot([1, 2, 3]);
});

Edno.test("steps", async (t) => {
  await t.step("child", async (t) => {
    await t.assertSnapshot("in step");
  });
});

Edno.test("custom name and serializer", async (t) => {
  await t.assertSnapshot("raw value", {
    name: "my custom name",
    serializer: (v) => `serialized: ${v}`,
  });
});

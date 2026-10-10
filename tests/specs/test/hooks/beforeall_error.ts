const logs: string[] = [];

Edno.test.beforeAll(() => {
  logs.push("beforeAll 1 executed");
  throw new Error("beforeAll 1 failed");
});

Edno.test.beforeAll(() => {
  logs.push("beforeAll 2 executed");
});

Edno.test("first test", () => {
  logs.push("test executed");
});

Edno.test.afterAll(() => {
  logs.push("afterAll 2 executed");
});

Edno.test.afterAll(() => {
  logs.push("afterAll 1 executed");
});

globalThis.onunload = () => {
  console.log(logs);
};

const logs: string[] = [];

Edno.test.beforeEach(() => {
  logs.push("beforeEach");
});

Edno.test.afterEach(() => {
  logs.push("afterEach");
});

Edno.test("first test", () => {
  logs.push("test executed");
  throw new Error("test threw");
});

globalThis.onunload = () => console.log(logs);

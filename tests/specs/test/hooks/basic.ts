const logs: string[] = [];

Edno.test.beforeAll(() => {
  logs.push("beforeAll 1");
});

Edno.test.beforeAll(() => {
  logs.push("beforeAll 2");
});

Edno.test.beforeAll(() => {
  logs.push("beforeAll 3");
});

// Multiple beforeEach hooks
Edno.test.beforeEach(() => {
  logs.push("beforeEach 1");
});

Edno.test.beforeEach(() => {
  logs.push("beforeEach 2");
});

// Multiple afterEach hooks
Edno.test.afterEach(() => {
  logs.push("afterEach 1");
});

Edno.test.afterEach(() => {
  logs.push("afterEach 2");
});

// Multiple afterAll hooks
Edno.test.afterAll(() => {
  logs.push("afterAll 1");
});

Edno.test.afterAll(() => {
  logs.push("afterAll 2");
});

Edno.test("first test", () => {
  logs.push("test 1");
});

Edno.test("second test", () => {
  logs.push("test 2");
});

Edno.test("third test", () => {
  logs.push("test 3");
});

globalThis.onunload = () => {
  console.log(logs);
};

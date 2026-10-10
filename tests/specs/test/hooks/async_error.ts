const logs: string[] = [];

Edno.test.beforeAll(async () => {
  logs.push("beforeAll started");
  await new Promise((resolve) => setTimeout(resolve, 10));
  logs.push("beforeAll completed");
});

let testCount = 0;

Edno.test.beforeEach(async () => {
  testCount++;
  logs.push(`beforeEach started for test ${testCount}`);

  if (testCount === 2) {
    // Async rejection
    await new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Async error in beforeEach")), 5);
    });
  }

  logs.push(`beforeEach completed for test ${testCount}`);
});

Edno.test.afterEach(async () => {
  logs.push(`afterEach started for test ${testCount}`);

  if (testCount === 3) {
    // Async rejection in afterEach
    await Promise.reject(new Error("Async error in afterEach"));
  }

  logs.push(`afterEach completed for test ${testCount}`);
});

Edno.test.afterAll(async () => {
  logs.push("afterAll started");
  await new Promise((resolve) => setTimeout(resolve, 5));
  logs.push("afterAll completed");
});

Edno.test("first test", () => {
  logs.push("first test executed");
});

Edno.test("second test (beforeEach fails)", () => {
  logs.push("second test executed");
});

Edno.test("third test (afterEach fails)", () => {
  logs.push("third test executed");
});

globalThis.onunload = () => {
  console.log(logs);
};

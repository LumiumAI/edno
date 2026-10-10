let testCount = 0;
const logs: string[] = [];

Edno.test.beforeEach(() => {
  testCount++;
  logs.push(`beforeEach executed for test ${testCount}`);

  // Throw error on second test
  if (testCount === 2) {
    throw new Error("beforeEach hook failed on second test");
  }
});

Edno.test.beforeEach(() => {
  logs.push(`beforeEach2 executed for test ${testCount}`);
});

Edno.test.afterEach(() => {
  logs.push(`afterEach executed for test ${testCount}`);
});

Edno.test("first test", () => {
  logs.push("first test executed");
});

// This test should fail because beforeEach throws
Edno.test("second test", () => {
  logs.push("second test executed");
});

// This test should still run
Edno.test("third test", () => {
  logs.push("third test executed");
});

globalThis.onunload = () => {
  console.log(logs);
};

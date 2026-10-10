let testCount = 0;
const logs: string[] = [];

Edno.test.beforeEach(() => {
  testCount++;
  logs.push(`beforeEach executed for test ${testCount}`);
});

Edno.test.afterEach(() => {
  logs.push(`afterEach2 executed for test ${testCount}`);
});

Edno.test.afterEach(() => {
  logs.push(`afterEach executed for test ${testCount}`);

  if (testCount === 1) {
    throw new Error("afterEach hook failed on second test");
  }
});

Edno.test("first test", () => {
  logs.push("first test executed");
});

Edno.test("second test", () => {
  logs.push("second test executed");
});

globalThis.onunload = () => {
  console.log(logs);
};

Edno.test(function foo() {
});

Edno.test.beforeAll(() => {});
Edno.test.beforeEach(() => {});
Edno.test.afterEach(() => {});
Edno.test.afterAll(() => {});
Edno.test.ignore("ignored", () => {});
Edno.test.only("only", () => {});
Edno.test.sanitizer({ ops: false });
Edno.test.each([1, 2])("each %d", () => {});

Edno.bench(function bar() {
});

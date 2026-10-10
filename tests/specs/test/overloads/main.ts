Edno.test("test0", () => {});
Edno.test(function test1() {});
Edno.test({ name: "test2", fn: () => {} });
Edno.test("test3", { permissions: "none" }, () => {});
Edno.test({ name: "test4" }, () => {});
Edno.test({ ignore: true }, function test5() {});

Edno.test("exit", { sanitizeExit: false }, function () {
  console.log("output before exit");
  Edno.exit(42);
});

Edno.test("never runs", function () {
  console.log("this test should never run");
});

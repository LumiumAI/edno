Edno.test("leak", function () {
  Edno.openSync("../../../testdata/run/001_hello.js");
  Edno.stdin.close();
});

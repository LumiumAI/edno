// https://github.com/denoland/deno/issues/8965

function test() {
  setTimeout(() => {}, 10000);
  setTimeout(() => {}, 10001);
}

Edno.test("test 1", () => test());

Edno.test("test 2", () => test());

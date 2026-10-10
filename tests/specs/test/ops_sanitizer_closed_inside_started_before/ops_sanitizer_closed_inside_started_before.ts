const timer = setTimeout(() => {}, 1000000);

Edno.test("test 1", () => {
  clearTimeout(timer);
});

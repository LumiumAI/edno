Edno.test("internal test harness modules are not remapped", () => {
  if (typeof Edno.test !== "function") {
    throw new Error("unreachable");
  }
});

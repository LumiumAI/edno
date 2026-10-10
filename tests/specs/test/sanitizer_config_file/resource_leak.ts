Edno.test("resource leak", () => {
  Edno.openSync("edno_no_sanitizers.json");
});

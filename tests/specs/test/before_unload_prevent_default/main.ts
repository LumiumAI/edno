addEventListener("beforeunload", (e) => {
  // The worker should be killed once tests are done regardless of this.
  e.preventDefault();
});

Edno.test("foo", () => {});

Edno.test.sanitizer({ ops: true });

Edno.test("timer leak caught by module sanitizer", () => {
  setTimeout(() => {}, 10000);
});

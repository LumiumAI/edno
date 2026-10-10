// No config file enables sanitizers, but module-level does
Edno.test.sanitizer({ ops: true });

Edno.test("timer leak caught by module sanitizer overriding config", () => {
  setTimeout(() => {}, 10000);
});

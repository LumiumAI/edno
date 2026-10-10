// CLI passes --sanitize-ops but module-level disables it
Edno.test.sanitizer({ ops: false });

Edno.test("timer leak allowed because module disables sanitizer", () => {
  setTimeout(() => {}, 10000);
});

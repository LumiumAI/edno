Edno.test.sanitizer({ resources: true });

Edno.test("resource leak caught by module sanitizer", () => {
  Edno.openSync("module_resources.ts");
});

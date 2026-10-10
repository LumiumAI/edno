Edno.test("SourceCode.text", () => {
  const plugin: Edno.lint.Plugin = {
    name: "sample",
    rules: {
      "test": {
        create: (ctx) => {
          ctx.sourceCode.text;
          return {};
        },
      },
    },
  };
  Edno.lint.runPlugin(
    plugin,
    "./test.js",
    `function add(a, b) {
  return a + b;
}

add(1, 2);`,
  );
});

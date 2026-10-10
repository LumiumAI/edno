const plugin = {
  name: "test-plugin",
  rules: {
    testRule: {
      create() {
        return {};
      },
    },
  },
};

Edno.lint.runPlugin(plugin, "source.ts", "export default {}");

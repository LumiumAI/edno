export default {
  name: "comments-test",
  rules: {
    "report-comments": {
      create(ctx) {
        return {
          Program(node) {
            const comments = node.comments;
            const values = comments.map((
              c: Edno.lint.LineComment | Edno.lint.BlockComment,
            ) => c.value.trim());
            console.log(`${ctx.filename}: ${JSON.stringify(values)}`);
          },
        };
      },
    },
  },
} satisfies Edno.lint.Plugin;

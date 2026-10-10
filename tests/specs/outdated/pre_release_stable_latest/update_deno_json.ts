Edno.writeTextFileSync(
  "edno.json",
  JSON.stringify({
    imports: {
      "@ednotest/pre-release-stable-latest":
        "npm:@ednotest/pre-release-stable-latest@^1.0.0-beta.13",
    },
  }),
);

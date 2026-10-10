if (!Edno.args.some((a) => a.includes("minimum-dependency-age"))) {
  Edno.writeTextFileSync(
    "edno.json",
    JSON.stringify({
      "minimumDependencyAge": "2025-05-01T20:00:00.000Z",
    }),
  );
}

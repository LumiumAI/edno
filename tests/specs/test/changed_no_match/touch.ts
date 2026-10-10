Edno.writeTextFileSync(
  "unrelated.ts",
  Edno.readTextFileSync("unrelated.ts") + "\n// changed\n",
);

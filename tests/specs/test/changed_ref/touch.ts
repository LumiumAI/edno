Edno.writeTextFileSync(
  "math.ts",
  Edno.readTextFileSync("math.ts") + "\n// changed\n",
);

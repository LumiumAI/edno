new Worker("data:,setTimeout(() => Edno.exit(2), 200)", { type: "module" });

try {
  await new Edno.Command("ps", {
    stdout: "inherit",
    stderr: "inherit",
  }).output();
} catch {
  Edno.exit(0);
}

if (Edno.exitCode != 0) {
  throw new Error("boom!");
}

Edno.exitCode = 42;

console.log("Edno.exitCode", Edno.exitCode);

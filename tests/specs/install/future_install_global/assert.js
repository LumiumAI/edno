const dirs = Edno.readDir("./bins/bin");

let found = false;
for await (const entry of dirs) {
  if (entry.name.includes("edno-test-bin")) {
    found = true;
  }
}
if (!found) {
  throw new Error("Failed to find test bin");
}

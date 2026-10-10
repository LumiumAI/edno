Edno.mkdirSync("dist", { recursive: true });
Edno.writeTextFileSync("dist/out.txt", "artifact");
console.log("generated");

// Confirms --dry-run did not modify files.
console.log("--- a/edno.json ---");
console.log(Edno.readTextFileSync("a/edno.json").trim());
console.log("--- b/edno.json ---");
console.log(Edno.readTextFileSync("b/edno.json").trim());

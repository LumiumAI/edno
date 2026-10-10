// Verifies post-bump file contents.
console.log("--- a/edno.json ---");
console.log(Edno.readTextFileSync("a/edno.json").trim());
console.log("--- b/edno.json ---");
console.log(Edno.readTextFileSync("b/edno.json").trim());
console.log("--- import_map.json ---");
console.log(Edno.readTextFileSync("import_map.json").trim());

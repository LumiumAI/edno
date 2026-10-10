// Build a tree where the denied path lives *inside* the dir we later try to
// remove recursively. The tree is created with full --allow-write so the deny
// scope only applies during the recursive-remove step.
Edno.mkdirSync("parent/denied", { recursive: true });
Edno.writeTextFileSync("parent/denied/keep.txt", "keep");
Edno.writeTextFileSync("parent/other.txt", "other");
console.log("setup ok");

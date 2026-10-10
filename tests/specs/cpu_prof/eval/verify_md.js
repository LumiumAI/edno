const files = [...Edno.readDirSync(".")].filter((f) => f.name.endsWith(".md"));
if (files.length === 0) {
  console.log("No .md files found");
  Edno.exit(1);
}
const content = Edno.readTextFileSync(files[0].name);
if (!content.includes("# CPU Profile")) {
  console.log("Missing header");
  Edno.exit(1);
}
if (!content.includes("## Hot Functions")) {
  console.log("Missing Hot Functions section");
  Edno.exit(1);
}
console.log("Valid markdown report");

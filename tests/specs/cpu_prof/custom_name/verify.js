const data = JSON.parse(Edno.readTextFileSync("custom.cpuprofile"));
if (!Array.isArray(data.nodes) || data.nodes.length === 0) {
  console.log("Invalid profile");
  Edno.exit(1);
}
console.log("Valid profile");

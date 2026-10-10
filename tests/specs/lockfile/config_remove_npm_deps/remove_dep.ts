const arg = Edno.args[0];
const filePath = import.meta.dirname + "/edno.json";
const ednoJson = JSON.parse(Edno.readTextFileSync(filePath));
if (!(arg in ednoJson.imports)) {
  throw new Error("Not found: " + arg);
}
delete ednoJson.imports[arg];
Edno.writeTextFileSync(filePath, JSON.stringify(ednoJson));

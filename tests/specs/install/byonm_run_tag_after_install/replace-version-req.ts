const newReq = Edno.args[0]?.trim();
if (!newReq) {
  throw new Error("Missing required argument");
}
const config = JSON.parse(Edno.readTextFileSync("edno.json"));
config.imports["@ednotest/esm-basic"] = `npm:@ednotest/esm-basic@${newReq}`;
Edno.writeTextFileSync("edno.json", JSON.stringify(config));

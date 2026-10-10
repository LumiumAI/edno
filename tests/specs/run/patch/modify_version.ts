const data = JSON.parse(Edno.readTextFileSync("./add/edno.json"));
data.version = "2.0.0";
Edno.writeTextFileSync("./add/edno.json", JSON.stringify(data, null, 2));

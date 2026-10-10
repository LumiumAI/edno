const file = Edno.args[0].trim();
const importKey = Edno.args[1].trim();
const newValue = Edno.args[2].trim();
const json = JSON.parse(Edno.readTextFileSync(file));
json["imports"][importKey] = newValue;
Edno.writeTextFileSync(file, JSON.stringify(json));

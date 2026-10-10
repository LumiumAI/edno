const dataDir = import.meta.dirname + "/data";
const files = Array.from(
  Edno.readDirSync(dataDir).map((entry) => dataDir + "/" + entry.name),
);
files.sort();
for (const file of files) {
  console.log(Edno.readTextFileSync(file).trim());
}

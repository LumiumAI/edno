const filePath = import.meta.dirname + "/edno.lock";
console.log(Edno.readTextFileSync(filePath).trim());

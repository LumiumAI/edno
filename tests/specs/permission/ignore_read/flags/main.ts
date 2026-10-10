try {
  Edno.readTextFileSync("./edno.json");
  console.log("loaded");
} catch (err) {
  console.log(err instanceof Edno.errors.NotFound);
}

try {
  Edno.readTextFileSync("data.txt");
  console.log("loaded");
} catch (err) {
  console.log(err instanceof Edno.errors.NotFound);
}

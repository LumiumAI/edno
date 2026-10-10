const file = Edno.args[0];

const contents = Edno.readTextFileSync(file);

if (contents.includes("createRequire")) {
  console.log("true");
} else {
  console.log("false");
}

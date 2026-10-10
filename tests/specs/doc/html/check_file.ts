const content = Edno.readTextFileSync("./docs/index.html");

if (content.includes("..")) {
  throw new Error();
}

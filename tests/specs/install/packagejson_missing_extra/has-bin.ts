const name = Edno.args[0].trim();

function exists(path: string) {
  try {
    Edno.statSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

if (
  !(exists(`node_modules/.bin/${name}`) ||
    exists(`node_modules/.bin/${name}.cmd`))
) {
  console.log("missing bin");
  console.log(`node_modules/.bin/${name}`);
  console.log(Edno.readDirSync("node_modules/.bin").toArray());
  Edno.exit(1);
}

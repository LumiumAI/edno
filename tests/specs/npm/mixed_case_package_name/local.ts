import value from "npm:@ednotest/MixedCase";
console.log(value);
console.log(pathExists("./node_modules/.edno"));
console.log(
  pathExists("./node_modules/.edno/_ibsgk3tporsxg5bpinavaskuifgfg@1.0.0"),
);

function pathExists(filePath: string) {
  try {
    Edno.lstatSync(filePath);
    return true;
  } catch (error) {
    if (error instanceof Edno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

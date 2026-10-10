console.log(Edno.env.get("VAR1"));
console.log(Edno.env.get("VAR2"));
const object = Edno.env.toObject();
console.log(object);
if ("VAR1" in object) {
  throw "FAILED";
}

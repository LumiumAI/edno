const bundle = await Edno.readTextFile("out.js");
if (bundle.includes("_computedKey")) {
  console.log("bundle still contains hoisted _computedKey");
  console.log(bundle);
  Edno.exit(1);
}
if (bundle.includes("class A")) {
  console.log("class A was not tree-shaken");
  console.log(bundle);
  Edno.exit(1);
}
console.log("ok");

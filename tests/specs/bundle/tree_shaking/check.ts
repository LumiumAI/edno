const bundle = await Edno.readTextFile("out.js");
if (!bundle.includes("USED_MARKER")) {
  console.log("missing used export");
  Edno.exit(1);
}
if (bundle.includes("UNUSED_MARKER")) {
  console.log("unused export was not tree-shaken");
  Edno.exit(1);
}
console.log("ok");

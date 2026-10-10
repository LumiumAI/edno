// Verify .d.ts files are placed in the outdir
const mainDts = Edno.statSync("dist/main.d.ts");
console.log(mainDts.isFile);
const helpersDts = Edno.statSync("dist/helpers.d.ts");
console.log(helpersDts.isFile);

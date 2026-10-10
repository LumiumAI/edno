// Verify .d.ts is placed next to the output file in the subdirectory
const mainDts = Edno.statSync("dist/main.d.ts");
console.log(mainDts.isFile);

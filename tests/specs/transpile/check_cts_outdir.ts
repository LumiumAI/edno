// Verify .cts files are transpiled to .cjs
const info = Edno.statSync("dist/helper.cjs");
console.log(info.isFile);

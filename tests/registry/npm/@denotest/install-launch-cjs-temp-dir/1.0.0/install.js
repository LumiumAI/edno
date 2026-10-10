const tempDir = Edno.makeTempDirSync();
try {
  // should work requiring these because this was launched via a node binary entrypoint
  Edno.writeTextFileSync(`${tempDir}/index.js`, "module.exports = require('./other');");
  Edno.writeTextFileSync(`${tempDir}/other.js`, "module.exports = (a, b) => a + b;");
  const add = require(`${tempDir}/index.js`);
  if (add(1, 2) !== 3) {
    throw new Error("FAILED");
  }
} finally {
  Edno.removeSync(tempDir, { recursive: true });
}

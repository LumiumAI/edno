await Edno.mkdir("allowed", { recursive: true });
await Promise.all([
  Edno.writeTextFile(
    "allowed/reexport.cjs",
    'module.exports = require("./inner.cjs");\n',
  ),
  Edno.writeTextFile("allowed/inner.cjs", 'exports.value = "from-inner";\n'),
  Edno.writeTextFile(
    "allowed/denied.cjs",
    'module.exports = require("../outside.cjs");\n',
  ),
  Edno.writeTextFile(
    "outside.cjs",
    "EDNO_STANDALONE_CJS_SOURCE_CANARY = ;\n",
  ),
]);

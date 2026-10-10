const hoisted = JSON.parse(
  Edno.readTextFileSync(
    "node_modules/@ednotest/different-nested-dep-child/package.json",
  ),
);
const nested = JSON.parse(
  Edno.readTextFileSync(
    "node_modules/@ednotest/needs-different-nested-dep-child-v2/node_modules/@ednotest/different-nested-dep-child/package.json",
  ),
);
console.log("hoisted:", hoisted.version);
console.log("nested:", nested.version);

import { sum } from "@ednotest/add";

console.log(sum(2, 2));

console.log(
  JSON.parse(Edno.readTextFileSync(
    new URL("node_modules/@ednotest/add/package.json", import.meta.url),
  )).version,
);

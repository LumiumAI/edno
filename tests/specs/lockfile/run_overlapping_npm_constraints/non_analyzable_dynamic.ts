import { add } from "npm:@ednotest/add@*";

function nonAnalyzable() {
  return "npm:@ednotest/add@0.5.0";
}

// npm deduplication does not happen for dynamic because
// the `npm:@ednotest/add@1.0.0` module has already been
// executed
const { sum } = await import(nonAnalyzable());

console.log(sum(1, 2));
console.log(add(1, 2));

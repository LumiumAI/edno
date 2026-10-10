import defaultImport, { getValue } from "npm:@ednotest/cjs-this-in-exports";
import * as namespaceImport from "npm:@ednotest/cjs-this-in-exports";

console.log(defaultImport.getValue());
// In Node this actually fails, but it seems to work in Edno
// so I guess there's no harm in that.
console.log(namespaceImport.getValue());

// This will throw because it's lost its context.
// (same thing occurs with Node's cjs -> esm translation)
getValue();

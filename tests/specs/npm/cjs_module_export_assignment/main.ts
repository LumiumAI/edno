import defaultImport, * as namespaceImport from "npm:@ednotest/cjs-module-export-assignment";
import { func } from "npm:@ednotest/cjs-module-export-assignment";

console.log(defaultImport);
console.log(namespaceImport);
console.log(func());

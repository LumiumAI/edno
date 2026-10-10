import { getKind } from "npm:@ednotest/cjs-import-dual@1";

const kind: "esm" = getKind(); // should cause a type error
console.log(kind);

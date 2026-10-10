import { getValue } from "npm:@ednotest/types-exports-import-types";

// should error here
const result: string = getValue();
console.log(result);

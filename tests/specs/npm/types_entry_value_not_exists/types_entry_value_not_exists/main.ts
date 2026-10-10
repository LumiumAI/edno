import { getValue } from "npm:@ednotest/types-entry-value-not-exists";

// should error here
const result: string = getValue();
console.log(result);

import { getValue } from "npm:@ednotest/types-no-types-entry";

// should error here
const result: string = getValue();
console.log(result);

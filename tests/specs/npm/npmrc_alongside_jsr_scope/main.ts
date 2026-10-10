import { add } from "npm:@jsr/ednotest__add";
import { getValue, setValue } from "npm:@ednotest/basic";

console.log(add(1, 2));
setValue(1);
console.log(getValue());

import { getValue, setValue } from "@ednotest/basic";
import * as test from "@ednotest2/basic";

console.log(getValue());
setValue(42);
console.log(getValue());

console.log(test.getValue());

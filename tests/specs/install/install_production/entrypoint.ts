import { getValue, setValue } from "npm:@ednotest/esm-basic";
import type { Fizzbuzz } from "npm:@ednotest/types";

const _value: Fizzbuzz = { fizz: "fizz", buzz: "buzz" };
setValue(42);
console.log(getValue());

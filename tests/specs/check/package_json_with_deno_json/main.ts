import { NUMBER_VALUE } from "other";
import * as test from "@ednotest/esm-basic";

test.setValue(2);
console.log(test.getValue());

// these should cause type errors
const _strValue1: string = NUMBER_VALUE;
const _strValue2: string = test.getValue();

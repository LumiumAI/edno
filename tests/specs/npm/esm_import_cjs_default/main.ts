// @ts-check
import cjsDefault, {
  MyClass as MyCjsClass,
} from "npm:@ednotest/cjs-default-export";
import * as cjsNamespace from "npm:@ednotest/cjs-default-export";
import esmDefault from "npm:@ednotest/esm-import-cjs-default";
import * as esmNamespace from "npm:@ednotest/esm-import-cjs-default";

console.log("Edno esm importing node cjs");
console.log("===========================");
console.log(cjsDefault);
console.log(cjsNamespace);
console.log("===========================");

console.log("Edno esm importing node esm");
console.log("===========================");
console.log(esmDefault);
console.log(esmNamespace);
console.log("===========================");

console.log(cjsDefault.default());
console.log(esmDefault());
console.log(MyCjsClass.someStaticMethod());

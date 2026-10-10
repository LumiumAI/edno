import { add } from "jsr:@ednotest/add@1.0.0";
import { url } from "@ednotest/esm-basic";
import { hello } from "@ednotest/node-addon";
import { printHello } from "http://localhost:4545/subdir/print_hello.ts";

console.log(`add(1, 2) = ${add(1, 2)}`);
console.log(`url = ${typeof url}`);
console.log(`hello() = ${hello()}`);
printHello();
console.log("success");

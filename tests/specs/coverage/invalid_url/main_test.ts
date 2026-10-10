import { foo } from "./main.ts";
import vm from "node:vm";
Edno.test(function fooWorks() {
  foo();
  vm.runInNewContext("console.log('hi')");
});

import { getValue, setValue } from "@ednotest/esm-basic";

export function sayHello() {
  setValue(5);
  console.log("Hello", getValue());
}

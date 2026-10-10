import { sayHello as sayHelloVuln2 } from "@ednotest/with-vuln2";

export function sayHello() {
  return sayHelloVuln2();
}
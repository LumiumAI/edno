import { getValue } from "mod";

Edno.test("test", () => {
  const testing = 1 + getValue();
  if (testing !== 6) {
    throw "FAIL";
  }
});

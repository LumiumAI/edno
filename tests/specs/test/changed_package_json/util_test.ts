import { id } from "./util.ts";

Edno.test("id", () => {
  if (id(5) !== 5) throw new Error("fail");
});

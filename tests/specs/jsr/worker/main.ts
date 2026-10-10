import { addAsync } from "jsr:@ednotest/worker";

addAsync(1, 2).then((result) => {
  console.log(result);
});

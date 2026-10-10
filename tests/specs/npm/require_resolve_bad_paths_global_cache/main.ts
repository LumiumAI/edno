import "npm:@ednotest/esm-basic";
import { resolve } from "npm:@ednotest/require-resolve";

console.log(resolve("@ednotest/esm-basic", {
  // when using the global cache, it should fallback to resolving bare
  // specifiers with the global cache when it can't find it via the paths
  paths: ["/home"],
}));

import mod from "npm:@ednotest/conditional-exports";
import foo from "npm:@ednotest/conditional-exports/foo.js";
import client from "npm:@ednotest/conditional-exports/client";
import clientFoo from "npm:@ednotest/conditional-exports/client/foo";
import clientBar from "npm:@ednotest/conditional-exports/client/bar";
import clientM from "npm:@ednotest/conditional-exports/client/m";
import supportsESM from "npm:supports-esm";

console.log(mod);
console.log(foo);
console.log(client);
console.log(clientFoo);
console.log(clientBar);
console.log(clientM);
console.log(supportsESM);

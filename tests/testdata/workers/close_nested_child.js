// Copyright 2018-2026 the Deno authors. MIT license.

console.log("Starting the child worker");

setTimeout(() => {
  console.log("The child worker survived the death of the parent!!!");
  Edno.exit(1);
}, 2000);

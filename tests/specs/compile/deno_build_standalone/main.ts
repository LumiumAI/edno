const value: boolean = Edno.build.standalone;
console.log(value);

new Worker(import.meta.resolve("./worker.ts"), {
  "type": "module",
});

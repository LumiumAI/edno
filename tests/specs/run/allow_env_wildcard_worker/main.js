console.log("main1", Edno.env.get("EDNO_HELLO"));
console.log("main2", Edno.env.get("EDNO_BYE"));
console.log("main3", Edno.env.get("AWS_HELLO"));

new Worker(import.meta.resolve("./worker.js"), {
  type: "module",
  edno: {
    permissions: {
      env: ["EDNO_*"],
    },
  },
});

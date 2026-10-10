new Worker(import.meta.resolve("./worker.ts"), {
  type: "module",
  edno: {
    permissions: {
      import: [],
    },
  },
});

Edno.test("no prompt", { permissions: { read: false } }, async () => {
  await Edno.readTextFile("./some_file.txt");
});

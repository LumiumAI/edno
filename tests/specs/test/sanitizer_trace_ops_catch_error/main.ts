// https://github.com/denoland/deno/pull/16970
Edno.test("handle thrown error in async function", async () => {
  const dirPath = Edno.makeTempDirSync();
  const filePath = `${dirPath}/file.txt`;
  try {
    await Edno.stat(filePath);
  } catch {
    await Edno.writeTextFile(filePath, "");
  } finally {
    await Edno.remove(filePath);
    await Edno.remove(dirPath);
  }
});

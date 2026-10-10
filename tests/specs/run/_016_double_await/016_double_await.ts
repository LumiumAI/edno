// This is to test if Edno would die at 2nd await
// See https://github.com/denoland/deno/issues/919
(async () => {
  const currDirInfo = await Edno.stat(".");
  const parentDirInfo = await Edno.stat("..");
  console.log(currDirInfo.isDirectory);
  console.log(parentDirInfo.isFile);
})();

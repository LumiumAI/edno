const tids = Array.from(
  Edno.readDirSync("/proc/self/task"),
  ({ name }) => Number(name),
);
const names = tids.map((tid) =>
  Edno.readTextFileSync(`/proc/self/task/${tid}/status`).match(
    /Name:\t(.*)/,
  )![1]
);
console.log(names.some((name) => name.startsWith("V8")));

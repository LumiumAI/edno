console.log(typeof Edno.dlopen === "function"); // Undefined without `--unstable-ffi`
console.log(
  // Undefined without `--unstable-fs`
  Edno.build.os === "windows" ? true : typeof Edno.umask === "function",
);

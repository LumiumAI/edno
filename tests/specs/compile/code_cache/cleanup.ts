import { tmpdir } from "node:os";

// cleanup the code cache file from a previous run
try {
  if (Edno.build.os === "windows") {
    Edno.removeSync(tmpdir() + "\\edno-compile-using_code_cache.exe.cache");
  } else {
    Edno.removeSync(tmpdir() + "/edno-compile-using_code_cache.cache");
  }
} catch {
}

// edno-fmt-ignore-file
import { toFileUrl } from "@std/path/to-file-url";

function tryGetCwd() {
  // will throw in one test but not the other
  try {
    return Edno.cwd()
  } catch {
    return import.meta.dirname;
  }
}

const fooExePath = tryGetCwd() + "/foo" + (Edno.build.os === "windows" ? ".exe" : "");
postMessage({
  envGlobal: (await Edno.permissions.query({ name: "env" })).state,
  envFoo: (await Edno.permissions.query({ name: "env", variable: "foo" })).state,
  envAbsent: (await Edno.permissions.query({ name: "env", variable: "absent" })).state,
  netGlobal: (await Edno.permissions.query({ name: "net" })).state,
  netFoo: (await Edno.permissions.query({ name: "net", host: "foo" })).state,
  netFoo8000: (await Edno.permissions.query({ name: "net", host: "foo:8000" })).state,
  netBar: (await Edno.permissions.query({ name: "net", host: "bar" })).state,
  netBar8000: (await Edno.permissions.query({ name: "net", host: "bar:8000" })).state,
  ffiGlobal: (await Edno.permissions.query({ name: "ffi" })).state,
  ffiFoo: (await Edno.permissions.query({ name: "ffi", path: new URL("foo", import.meta.url) })).state,
  ffiBar: (await Edno.permissions.query({ name: "ffi", path: "bar" })).state,
  ffiAbsent: (await Edno.permissions.query({ name: "ffi", path: "absent" })).state,
  readGlobal: (await Edno.permissions.query({ name: "read" })).state,
  readFoo: (await Edno.permissions.query({ name: "read", path: new URL("foo", import.meta.url) })).state,
  readBar: (await Edno.permissions.query({ name: "read", path: "bar" })).state,
  readAbsent: (await Edno.permissions.query({ name: "read", path: "../absent" })).state,
  runGlobal: (await Edno.permissions.query({ name: "run" })).state,
  runFoo: (await Edno.permissions.query({ name: "run", command: toFileUrl(fooExePath) })).state,
  runFooPath: (await Edno.permissions.query({ name: "run", command: fooExePath })).state,
  runBar: (await Edno.permissions.query({ name: "run", command: "bar" })).state,
  runBaz: (await Edno.permissions.query({ name: "run", command: "./baz" })).state,
  runUnresolved: (await Edno.permissions.query({ name: "run", command: "unresolved-exec" })).state,
  runAbsent: (await Edno.permissions.query({ name: "run", command: "absent" })).state,
  writeGlobal: (await Edno.permissions.query({ name: "write" })).state,
  writeFoo: (await Edno.permissions.query({ name: "write", path: new URL("foo", import.meta.url) })).state,
  writeBar: (await Edno.permissions.query({ name: "write", path: "bar" })).state,
  writeAbsent: (await Edno.permissions.query({ name: "write", path: "absent" })).state,
  importGlobal: (await Edno.permissions.query({ name: "import" })).state,
  importFoo: (await Edno.permissions.query({ name: "import", host: "foo" })).state,
  importFoo8000: (await Edno.permissions.query({ name: "import", host: "foo:8000" })).state,
  importBar: (await Edno.permissions.query({ name: "import", host: "bar" })).state,
  importBar8000: (await Edno.permissions.query({ name: "import", host: "bar:8000" })).state,
  importAbsent: (await Edno.permissions.query({ name: "import", host: "absent" })).state,
});

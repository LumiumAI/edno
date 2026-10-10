const targetDir = Edno.execPath().replace(/[^\/\\]+$/, "");
const [libPrefix, libSuffix] = {
  darwin: ["lib", "dylib"],
  linux: ["lib", "so"],
  windows: ["", "dll"],
}[Edno.build.os];
const libFileName = `${libPrefix}test_ffi.${libSuffix}`;
const libPath = `${targetDir}/${libFileName}`;

Edno.copyFileSync(libPath, import.meta.dirname + "/" + libFileName);

const [libPrefix, libSuffix] = {
  darwin: ["lib", "dylib"],
  linux: ["lib", "so"],
  windows: ["", "dll"],
}[Edno.build.os];
const libPath = `${import.meta.dirname}/${libPrefix}test_ffi.${libSuffix}`;

const dylib = Edno.dlopen(
  libPath,
  {
    print_something: {
      parameters: [],
      result: "void",
    },
  } as const,
);

dylib.symbols.print_something();

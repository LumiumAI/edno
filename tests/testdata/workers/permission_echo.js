self.onmessage = async () => {
  const env = await Edno.permissions.query({ name: "env" });
  const ffi = await Edno.permissions.query({ name: "ffi" });
  const net = await Edno.permissions.query({ name: "net" });
  const read = await Edno.permissions.query({ name: "read" });
  const run = await Edno.permissions.query({ name: "run" });
  const write = await Edno.permissions.query({ name: "write" });
  const imports = await Edno.permissions.query({ name: "import" });
  self.postMessage({
    env: env.state,
    ffi: ffi.state,
    net: net.state,
    read: read.state,
    run: run.state,
    write: write.state,
    import: imports.state,
  });
  self.close();
};

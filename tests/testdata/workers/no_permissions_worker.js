self.onmessage = async () => {
  const net = await Edno.permissions.query({ name: "net" });
  const ffi = await Edno.permissions.query({ name: "ffi" });
  const read = await Edno.permissions.query({ name: "read" });
  const run = await Edno.permissions.query({ name: "run" });
  const write = await Edno.permissions.query({ name: "write" });
  const imports = await Edno.permissions.query({ name: "import" });
  self.postMessage(
    net.state === "prompt" &&
      ffi.state === "prompt" &&
      read.state === "prompt" &&
      run.state === "prompt" &&
      write.state === "prompt" &&
      imports.state === "prompt",
  );
  self.close();
};

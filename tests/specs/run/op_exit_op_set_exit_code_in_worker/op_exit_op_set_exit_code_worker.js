self.onmessage = () => {
  self.close = () => {
    self.postMessage("overridden self.close was called");
  };
  Edno[Edno.internal].core.ops.op_set_exit_code(42);
  Edno.exit();
};

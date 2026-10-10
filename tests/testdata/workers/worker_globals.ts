onmessage = function () {
  postMessage(
    [
      self instanceof DedicatedWorkerGlobalScope,
      self instanceof WorkerGlobalScope,
      self instanceof EventTarget,
      // TODO(nayeemrmn): Add `WorkerNavigator` to deno_lint globals.
      // edno-lint-ignore no-undef
      navigator instanceof WorkerNavigator,
    ].join(", "),
  );
  close();
};

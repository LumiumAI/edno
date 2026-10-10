onmessage = function (e) {
  if (typeof self.Edno !== "undefined") {
    throw new Error("Edno namespace unexpectedly available in worker");
  }

  postMessage(e.data);
};

import { assert } from "@std/assert";

onmessage = function (e) {
  if (typeof self.Edno === "undefined") {
    throw new Error("Edno namespace not available in worker");
  }

  assert(!Object.isFrozen(self.Edno));

  const desc = Object.getOwnPropertyDescriptor(self, "Edno");
  assert(desc);
  assert(desc.configurable);
  assert(!desc.writable);

  postMessage(e.data);
};

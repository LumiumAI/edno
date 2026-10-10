import { getValue, setValue } from "@ednotest/esm-basic";

self.onmessage = (e) => {
  setValue(7);
  (self as unknown as Worker).postMessage(
    "pong-" + e.data + "-" + getValue(),
  );
};

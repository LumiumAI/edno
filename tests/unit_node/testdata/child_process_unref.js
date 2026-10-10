import cp from "node:child_process";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "infinite_loop.js",
);
const childProcess = cp.spawn(Edno.execPath(), ["run", script]);
childProcess.unref();

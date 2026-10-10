import { spawn } from "node:child_process";
import { join } from "node:path";

const markerFile = join(Edno.cwd(), "marker.txt");
const child = spawn(Edno.execPath(), [
  "run",
  "--allow-write",
  join(import.meta.dirname!, "child.ts"),
  markerFile,
], { stdio: "ignore" });

child.unref();
// Parent exits immediately — child should continue running and create the marker file.

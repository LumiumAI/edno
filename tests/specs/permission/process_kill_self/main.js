import process from "node:process";

// Signal 0 is a "is this process alive" check that does not actually
// deliver a signal. Sending it to ourselves should not require
// --allow-run.
process.kill(process.pid, 0);
Edno.kill(Edno.pid, 0);
console.log("ok");

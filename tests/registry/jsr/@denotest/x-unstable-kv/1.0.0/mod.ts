// Tiny JSR script used by `edno x` spec tests to verify that
// `--unstable-*` flags are forwarded into the spawned `edno run` invocation.
const kv = await Edno.openKv(":memory:");
await kv.set(["x"], 42);
const entry = await kv.get(["x"]);
console.log("ok:", entry.value);
kv.close();

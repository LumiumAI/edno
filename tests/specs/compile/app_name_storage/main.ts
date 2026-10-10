// Storage identity is driven by the app name, not the binary file name:
// binaries sharing an `--app-name` share a store; differing names do not.
const kv = await Edno.openKv();
const key = ["greeting"];

if (Edno.args[0] === "set") {
  await kv.set(key, "hi edno team.");
  console.log("set");
} else {
  const entry = await kv.get(key);
  console.log("value:", entry.value);
}

kv.close();

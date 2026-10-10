// Regression test for https://github.com/denoland/deno/issues/24318
// `Edno.openKv()` without an explicit path should persist to disk in a
// compiled binary, not silently fall back to an in-memory database.
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

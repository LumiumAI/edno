const path = Edno.args[0] + "/npm/localhost_4260/@ednotest/bin/registry.json";
const fileText = Edno.readTextFileSync(path);
const data = JSON.parse(fileText);
if (data.versions["1.0.0"] == null || data["dist-tags"].latest !== "1.0.0") {
  throw new Error("Test relies on version 1.0.0 to be the latest version");
}
delete data.versions["1.0.0"];
data["dist-tags"].latest = "0.5.0";
delete data["_deno.etag"];
Edno.writeTextFileSync(path, JSON.stringify(data));
Edno.remove("node_modules", { recursive: true });

// assert this exists
if (!Edno.statSync("edno.lock").isFile) {
  throw new Error("Expected a edno.lock file.");
}

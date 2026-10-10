const cmd = new Edno.Command(Edno.execPath(), {
  args: [
    "run",
    "--deny-write",
    "--v8-flags=--max-old-space-size=20",
    "oom.mjs",
  ],
  stdout: "null",
  stderr: "piped",
});
const { success, stderr } = await cmd.output();
const text = new TextDecoder().decode(stderr);

if (success) {
  console.error("child unexpectedly exited successfully");
  Edno.exit(1);
}
if (!text.includes("Requires write access")) {
  console.error("child did not fail with a write permission error");
  console.error(text);
  Edno.exit(1);
}
if (!text.includes("v8.setHeapSnapshotNearHeapLimit")) {
  console.error(
    "permission error did not name v8.setHeapSnapshotNearHeapLimit",
  );
  console.error(text);
  Edno.exit(1);
}

for (const entry of Edno.readDirSync(".")) {
  if (entry.isFile && entry.name.endsWith(".heapsnapshot")) {
    console.error(`unexpected heap snapshot file: ${entry.name}`);
    Edno.exit(1);
  }
}

console.log("deny-write-blocked");

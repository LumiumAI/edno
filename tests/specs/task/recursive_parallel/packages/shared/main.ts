// Sibling-barrier handshake. Each member writes its own marker, then polls
// until all three markers exist. This only completes when the three `dev`
// tasks run concurrently — under sequential execution it would deadlock and
// the test would time out.
const NAME = "shared";
const root = Edno.env.get("INIT_CWD")!;
console.log(`${NAME} ready`);
await Edno.writeTextFile(`${root}/marker.${NAME}`, "");
const deadline = Date.now() + 15_000;
while (true) {
  try {
    await Edno.stat(`${root}/marker.server`);
    await Edno.stat(`${root}/marker.web`);
    await Edno.stat(`${root}/marker.shared`);
    break;
  } catch {
    if (Date.now() > deadline) {
      console.error(`${NAME}: timed out waiting for siblings`);
      Edno.exit(1);
    }
    await new Promise((r) => setTimeout(r, 30));
  }
}
console.log(`${NAME} done`);

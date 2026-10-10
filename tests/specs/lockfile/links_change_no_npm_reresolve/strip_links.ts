// Rewrites the lockfile to drop the `links` section, simulating a lockfile
// produced by an older edno version that did not track workspace links. On the
// next load edno re-derives the links from the config and sees them as
// "changed", which previously forced a full npm re-resolution.
const path = Edno.args[0].trim();
const lock = JSON.parse(Edno.readTextFileSync(path));
delete lock.links;
if (lock.workspace) {
  delete lock.workspace.links;
}
Edno.writeTextFileSync(path, JSON.stringify(lock, null, 2) + "\n");

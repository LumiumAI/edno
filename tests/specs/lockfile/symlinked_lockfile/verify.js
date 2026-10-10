// `edno add` must write through the symlink: the `edno.lock` symlink should be
// preserved and the real target file should receive the update, instead of the
// symlink being clobbered with a fresh regular file.
console.log("edno.lock is symlink:", Edno.lstatSync("edno.lock").isSymlink);
const target = Edno.readTextFileSync("real/edno.lock");
console.log("target updated:", target.includes("@ednotest/add"));

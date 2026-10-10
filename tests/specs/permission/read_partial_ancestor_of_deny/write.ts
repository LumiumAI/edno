// `Edno.writeTextFile` to a file whose parent is an ancestor of the denied
// path must succeed; writes inside the denied scope are still blocked.
Edno.writeTextFileSync("hello.txt", "hi");
console.log("write hello.txt: ok");

try {
  Edno.writeTextFileSync("denied/x.txt", "x");
  console.log("write denied/x.txt: UNEXPECTED OK");
} catch (e) {
  console.log("write denied/x.txt:", (e as Error).name);
}

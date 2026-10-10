// Run without permissions.
const buf = new Uint8Array(1);
console.log("Enter 'yy':");
await Edno.stdin.read(buf);
await Edno.permissions.request({ "name": "env" });
console.log("\n\nOwned", Edno.env.get("SECRET"));

const buf: Uint8Array = await Edno.readFile("./hello.txt");
const n: number = await Edno.stdout.write(buf);
console.log(`\n\nwrite ${n}`);

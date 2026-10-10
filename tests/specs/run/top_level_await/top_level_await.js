const buf = await Edno.readFile("./hello.txt");
const n = await Edno.stdout.write(buf);
console.log(`\n\nwrite ${n}`);

const filename = Edno.args[0];
using file = await Edno.open(filename);

await file.readable.pipeTo(Edno.stdout.writable);

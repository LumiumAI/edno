const encoder = new TextEncoder();

const pending = [];

// do this a bunch of times to ensure it doesn't race
// and everything happens in order
for (let i = 0; i < 100; i++) {
  pending.push(Edno.stdout.write(encoder.encode("Hello, ")));
  pending.push(Edno.stdout.write(encoder.encode(`world! ${i}`)));
  pending.push(Edno.stdout.write(encoder.encode("\n")));
}

await Promise.all(pending);

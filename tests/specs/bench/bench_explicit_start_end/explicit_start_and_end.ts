Edno.bench("start and end", (t) => {
  const id = setInterval(() => {}, 1000);
  t.start();
  Edno.inspect(id);
  t.end();
  clearInterval(id);
});

Edno.bench("start only", (t) => {
  const id = setInterval(() => {}, 1000);
  t.start();
  Edno.inspect(id);
  clearInterval(id);
});

Edno.bench("end only", (t) => {
  const id = setInterval(() => {}, 1000);
  Edno.inspect(id);
  t.end();
  clearInterval(id);
});

Edno.bench("double start", (t) => {
  const id = setInterval(() => {}, 1000);
  t.start();
  t.start();
  Edno.inspect(id);
  t.end();
  clearInterval(id);
});

let captured: Edno.BenchContext;

Edno.bench("double end", (t) => {
  captured = t;
  const id = setInterval(() => {}, 1000);
  t.start();
  Edno.inspect(id);
  t.end();
  t.end();
  clearInterval(id);
});

Edno.bench("captured", () => {
  const id = setInterval(() => {}, 1000);
  captured!.start();
  Edno.inspect(id);
  captured!.end();
  clearInterval(id);
});

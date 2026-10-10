Edno.bench("bench0", () => {});
Edno.bench(function bench1() {});
Edno.bench({ name: "bench2", fn: () => {} });
Edno.bench("bench3", { permissions: "none" }, () => {});
Edno.bench({ name: "bench4" }, () => {});
Edno.bench({ ignore: true }, function bench5() {});

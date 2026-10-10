Edno.env.set("LD_PRELOAD", "./libpreload.so");

try {
  new Edno.Command("curl").spawn();
} catch (err) {
  console.log(err);
}

Edno.env.set("DYLD_FALLBACK_LIBRARY_PATH", "./libpreload.so");

try {
  Edno.run({ cmd: ["curl"] }).spawnSync();
} catch (err) {
  console.log(err);
}

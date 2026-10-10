try {
  new Edno.Command("curl", {
    env: {
      "LD_PRELOAD": "./libpreload.so",
    },
  }).spawn();
} catch (err) {
  console.log(err);
}

try {
  Edno.run({
    cmd: ["curl"],
    env: {
      "LD_PRELOAD": "./libpreload.so",
    },
  });
} catch (err) {
  console.log(err);
}

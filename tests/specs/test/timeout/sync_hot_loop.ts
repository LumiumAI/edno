// Proof that v8::TerminateExecution interrupts a synchronous hot loop —
// the second test must still run after the first is killed.
Edno.test({
  name: "spins forever",
  timeout: 100,
  fn() {
    while (true) {}
  },
});

Edno.test("runs after the spin", () => {});

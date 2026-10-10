console.error("[ISOLATE] Registering test-cron");
Edno.cron("test-cron", "* * * * *", () => {
  console.error("[ISOLATE] test-cron executed");
});

console.error("[ISOLATE] Registering other-cron");
Edno.cron("other-cron", "*/5 * * * *", () => {
  console.error("[ISOLATE] other-cron executed");
});

console.error("[ISOLATE] isolate booted");

console.error("[ISOLATE] Waiting for execution...");
await new Promise((resolve) => setTimeout(resolve, 2000));
console.error("[ISOLATE] Exiting");

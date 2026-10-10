console.error("[ISOLATE] Starting");

// Register a cron job
console.error("[ISOLATE] Registering test-cron");
Edno.cron("test-cron", "* * * * *", () => {
  console.error("[ISOLATE] test-cron executed");
});
console.error("[ISOLATE] test-cron registered successfully");

// Keep alive with Edno.serve
Edno.serve({ port: 0 }, () => new Response("Hello"));

console.error("[ISOLATE] Starting");

// 1. Register cron BEFORE Edno.serve
console.error("[ISOLATE] Registering early-cron (before serve)");
Edno.cron("early-cron", "* * * * *", () => {
  console.error("[ISOLATE] early-cron executed");
});
console.error("[ISOLATE] early-cron registered successfully");

// 2. Start HTTP server
Edno.serve({ port: 0 }, () => new Response("ok"));
console.error("[ISOLATE] Edno.serve started");

// 3. Wait for rejection message to be processed
await new Promise((resolve) => setTimeout(resolve, 1500));

// 4. Try to register cron AFTER Edno.serve
try {
  Edno.cron("late-cron", "* * * * *", () => {
    console.error("[ISOLATE] late-cron executed (should never happen)");
  });
  console.error("[ISOLATE] ERROR: late-cron should have been rejected");
  Edno.exit(1);
} catch (error) {
  console.error(
    "[ISOLATE] late-cron rejected as expected with error:",
    error.message,
  );
}

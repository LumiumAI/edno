try {
  await import("./main.cjs");
  console.log("unexpected success");
  Edno.exit(1);
} catch (err) {
  const message = err instanceof Error
    ? `${err.message}\n${err.stack ?? ""}`
    : String(err);
  if (message.includes("EDNO_CJS_ANALYZER_SOURCE_CANARY")) {
    console.log("unexpected source");
    Edno.exit(1);
  }
  if (message.includes("Requires read access")) {
    console.log("blocked");
  } else {
    console.log("unexpected error");
    Edno.exit(1);
  }
}

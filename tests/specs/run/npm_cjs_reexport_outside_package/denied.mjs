try {
  await import("package-denied");
  console.log("unexpected success");
  Edno.exit(1);
} catch (err) {
  const message = err instanceof Error
    ? `${err.message}\n${err.stack ?? ""}`
    : String(err);
  if (
    message.includes("Requires read access") &&
    !message.includes("EDNO_CJS_ANALYZER_SOURCE_CANARY")
  ) {
    console.log("blocked");
  } else {
    console.log("unexpected error");
    Edno.exit(1);
  }
}

try {
  await import("./a.ts");
} catch {
  console.log("fail");
}
Edno.writeTextFileSync("a.ts", "");
try {
  await import("./a.ts");
} catch {
  console.log("fail");
}

const file = "./a" + ".ts";
try {
  await import(file);
} catch {
  console.log("fail");
}
Edno.writeTextFileSync("a.ts", "");
try {
  await import(file);
} catch {
  console.log("fail");
}

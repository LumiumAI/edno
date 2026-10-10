Edno.writeTextFileSync("./b.ts", "console.log(1);");
await import("./a.ts");
Edno.writeTextFileSync("./b.ts", "console.log(2);");

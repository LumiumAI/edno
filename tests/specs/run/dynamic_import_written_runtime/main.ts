Edno.writeTextFileSync("./a.ts", "console.log(1);");
await import("./a.ts");
Edno.writeTextFileSync("./a.ts", "console.log(2);");

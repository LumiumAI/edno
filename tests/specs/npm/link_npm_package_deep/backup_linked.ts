try {
  Edno.removeSync("./linked_backup", { recursive: true });
} catch {}
try {
  Edno.mkdirSync("./linked_backup");
} catch {}
Edno.copyFileSync("./linked/main.mjs", "./linked_backup/main.mjs");
Edno.copyFileSync("./linked/package.json", "./linked_backup/package.json");

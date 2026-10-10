try {
  Edno.removeSync("./cowsay_backup", { recursive: true });
} catch {}
try {
  Edno.mkdirSync("./cowsay_backup");
} catch {}
Edno.copyFileSync("./cowsay/main.mjs", "./cowsay_backup/main.mjs");
Edno.copyFileSync("./cowsay/package.json", "./cowsay_backup/package.json");

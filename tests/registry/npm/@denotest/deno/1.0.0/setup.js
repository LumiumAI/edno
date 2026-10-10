import fs from "node:fs";
import process from "node:process";
import path from "node:path";

const binDir = path.join(import.meta.dirname, "bin");
if (process.platform === "win32") {
  const pkgJson = JSON.parse(
    fs.readFileSync(path.join(import.meta.dirname, "package.json")).toString(),
  );
  pkgJson.bin.edno = pkgJson.bin.edno + ".exe";
  fs.writeFileSync(
    path.join(import.meta.dirname, "package.json"),
    JSON.stringify(pkgJson, null, 2),
  );
  fs.mkdirSync(binDir, { recursive: true });
  fs.copyFileSync(process.execPath, path.join(binDir, "edno.exe"));
} else {
  fs.mkdirSync(binDir, { recursive: true });
  fs.copyFileSync(process.execPath, path.join(binDir, "edno"));
}

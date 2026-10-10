import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";

try {
  Edno.readTextFileSync("./edno.json");
  console.log("loaded");
} catch (err) {
  console.log(err instanceof Edno.errors.NotFound);
}

try {
  console.log(fs.existsSync("./edno.json"));
} catch {
  console.log("failed");
}
try {
  console.log(
    await new Promise((resolve) => {
      fs.exists("./edno.json", resolve);
    }),
  );
} catch {
  console.log("failed");
}

try {
  await fsPromises.stat("./edno.json");
} catch (err) {
  console.log(
    err instanceof Error && "code" in err &&
      err.code === "ENOENT",
  );
}

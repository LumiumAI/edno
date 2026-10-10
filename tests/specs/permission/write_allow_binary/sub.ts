const binaryName = Edno.build.os === "windows" ? "binary.exe" : "binary";

Edno.writeTextFileSync(binaryName, "");

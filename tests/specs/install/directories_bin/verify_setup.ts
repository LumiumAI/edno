const isWindows = Edno.build.os === "windows";
for (const item of Edno.readDirSync("./node_modules/.bin")) {
  if (isWindows && item.name === "cli.cmd") {
    console.log("yes");
  } else if (!isWindows && item.name === "cli") {
    console.log("yes");
  }
}

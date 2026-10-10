Edno.readTextFileSync("./run/permission_broker/scratch.txt");
Edno.readTextFileSync("./run/permission_broker/scratch.txt");
Edno.readTextFileSync("./run/permission_broker/log.txt");
Edno.writeTextFileSync(
  "./run/permission_broker/log.txt",
  "Lorem ipsum dolor sit amet",
);
console.log("env", Edno.env.toObject());

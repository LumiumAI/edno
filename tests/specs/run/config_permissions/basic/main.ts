console.log(Edno.permissions.querySync({ name: "read", path: "./data" }).state);
console.log(Edno.permissions.querySync({ name: "read", path: "." }).state);
console.log(
  Edno.permissions.querySync({ name: "write", path: "./data" }).state,
);
console.log(Edno.permissions.querySync({ name: "write", path: "." }).state);

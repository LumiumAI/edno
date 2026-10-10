console.log(
  "Root:",
  Edno.permissions.querySync({
    name: "read",
    path: import.meta.dirname + "/data",
  }).state,
);
console.log(
  "Member:",
  Edno.permissions.querySync({
    name: "read",
    path: import.meta.dirname + "/a/data",
  }).state,
);

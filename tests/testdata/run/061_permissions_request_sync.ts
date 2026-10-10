const status1 =
  Edno.permissions.requestSync({ name: "read", path: "foo" }).state;
const status2 = Edno.permissions.querySync({ name: "read", path: "bar" }).state;
const status3 =
  Edno.permissions.requestSync({ name: "read", path: "bar" }).state;
console.log(status1);
console.log(status2);
console.log(status3);

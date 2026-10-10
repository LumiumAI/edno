const status1 = Edno.permissions.revokeSync({ name: "read" });
console.log(status1);
const status2 = Edno.permissions.querySync({ name: "read", path: "foo" });
console.log(status2);
const status3 = Edno.permissions.querySync({ name: "read", path: "bar" });
console.log(status3);

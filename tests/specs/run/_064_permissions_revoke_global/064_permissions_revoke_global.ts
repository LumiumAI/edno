const status1 = await Edno.permissions.revoke({ name: "read" });
console.log(status1);
const status2 = await Edno.permissions.query({ name: "read", path: "foo" });
console.log(status2);
const status3 = await Edno.permissions.query({ name: "read", path: "bar" });
console.log(status3);

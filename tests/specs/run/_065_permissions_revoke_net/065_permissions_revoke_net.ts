const status1 = await Edno.permissions.query({ name: "net" });
console.log(status1);
const status2 = await Edno.permissions.revoke({ name: "net" });
console.log(status2);
const status3 = await Edno.permissions.query({ name: "net" });
console.log(status3);

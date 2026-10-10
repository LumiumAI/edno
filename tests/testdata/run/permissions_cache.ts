const status = await Edno.permissions.query({ name: "read", path: "foo" });
console.log(status.state);
status.onchange = () => console.log(status.state);
await Edno.permissions.request({ name: "read", path: "foo" }); // y
await Edno.permissions.revoke({ name: "read", path: "foo" });

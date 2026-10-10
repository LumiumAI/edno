Edno.permissions.requestSync({ name: "run", command: "FOO" });
Edno.permissions.requestSync({ name: "run", command: "BAR" });

Edno.permissions.requestSync({ name: "read", path: "FOO" });
Edno.permissions.requestSync({ name: "read", path: "BAR" });

Edno.permissions.requestSync({ name: "write", path: "FOO" });
Edno.permissions.requestSync({ name: "write", path: "BAR" });

Edno.permissions.requestSync({ name: "net", host: "FOO" });
Edno.permissions.requestSync({ name: "net", host: "BAR" });

Edno.permissions.requestSync({ name: "env", variable: "FOO" });
Edno.permissions.requestSync({ name: "env", variable: "BAR" });

Edno.permissions.requestSync({ name: "sys", kind: "loadavg" });
Edno.permissions.requestSync({ name: "sys", kind: "hostname" });

Edno.permissions.requestSync({ name: "ffi", path: "FOO" });
Edno.permissions.requestSync({ name: "ffi", path: "BAR" });

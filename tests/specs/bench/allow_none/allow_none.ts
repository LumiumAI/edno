const permissions: Edno.PermissionName[] = [
  "read",
  "write",
  "net",
  "env",
  "run",
  "ffi",
];

for (const name of permissions) {
  Edno.bench({
    name,
    permissions: {
      [name]: true,
    },
    fn() {
      throw new Error("unreachable");
    },
  });
}

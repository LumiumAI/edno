import { assertEquals } from "jsr:@std/assert";

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
    name: `${name} false`,
    permissions: {
      [name]: false,
    },
    async fn() {
      for await (const n of permissions) {
        const status = await Edno.permissions.query({ name: n });
        assertEquals(status.state, "prompt");
      }
    },
  });

  Edno.bench({
    name: `${name} true`,
    permissions: {
      [name]: true,
    },
    async fn() {
      for await (const n of permissions) {
        const status = await Edno.permissions.query({ name: n });
        if (n === name) {
          assertEquals(status.state, "granted");
        } else {
          assertEquals(status.state, "prompt");
        }
      }
    },
  });
}

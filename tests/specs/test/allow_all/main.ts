import { assertEquals } from "@std/assert";

const permissions: Edno.PermissionName[] = [
  "read",
  "write",
  "net",
  "env",
  "run",
  "ffi",
];

for (const name of permissions) {
  Edno.test({
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

  Edno.test({
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

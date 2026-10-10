// Copyright 2018-2026 the Deno authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "./test_util.ts";

Edno.test(async function permissionInvalidName() {
  await assertRejects(async () => {
    // edno-lint-ignore no-explicit-any
    await Edno.permissions.query({ name: "foo" as any });
  }, TypeError);
});

Edno.test(function permissionInvalidNameSync() {
  assertThrows(() => {
    // edno-lint-ignore no-explicit-any
    Edno.permissions.querySync({ name: "foo" as any });
  }, TypeError);
});

Edno.test(
  { permissions: { net: [] } },
  async function permissionNetInvalidHost() {
    await assertRejects(async () => {
      await Edno.permissions.query({ name: "net", host: ":" });
    }, URIError);
  },
);

Edno.test(
  { permissions: { net: [] } },
  function permissionNetInvalidHostSync() {
    assertThrows(() => {
      Edno.permissions.querySync({ name: "net", host: ":" });
    }, URIError);
  },
);

Edno.test(
  { permissions: { sys: [] } },
  async function permissionSysValidKind() {
    await Edno.permissions.query({ name: "sys", kind: "loadavg" });
    await Edno.permissions.query({ name: "sys", kind: "osRelease" });
    await Edno.permissions.query({ name: "sys", kind: "osUptime" });
    await Edno.permissions.query({ name: "sys", kind: "networkInterfaces" });
    await Edno.permissions.query({ name: "sys", kind: "systemMemoryInfo" });
    await Edno.permissions.query({ name: "sys", kind: "hostname" });
    await Edno.permissions.query({ name: "sys", kind: "uid" });
    await Edno.permissions.query({ name: "sys", kind: "gid" });
    await Edno.permissions.query({ name: "sys", kind: "cpus" });
  },
);

Edno.test(
  { permissions: { sys: [] } },
  function permissionSysValidKindSync() {
    Edno.permissions.querySync({ name: "sys", kind: "loadavg" });
    Edno.permissions.querySync({ name: "sys", kind: "osRelease" });
    Edno.permissions.querySync({ name: "sys", kind: "networkInterfaces" });
    Edno.permissions.querySync({ name: "sys", kind: "systemMemoryInfo" });
    Edno.permissions.querySync({ name: "sys", kind: "hostname" });
    Edno.permissions.querySync({ name: "sys", kind: "uid" });
    Edno.permissions.querySync({ name: "sys", kind: "gid" });
    Edno.permissions.querySync({ name: "sys", kind: "cpus" });
  },
);

Edno.test(
  { permissions: { sys: [] } },
  async function permissionSysInvalidKind() {
    await assertRejects(async () => {
      // edno-lint-ignore no-explicit-any
      await Edno.permissions.query({ name: "sys", kind: "abc" as any });
    }, TypeError);
  },
);

Edno.test(
  { permissions: { sys: [] } },
  function permissionSysInvalidKindSync() {
    assertThrows(() => {
      // edno-lint-ignore no-explicit-any
      Edno.permissions.querySync({ name: "sys", kind: "abc" as any });
    }, TypeError);
  },
);

Edno.test(async function permissionQueryReturnsEventTarget() {
  const status = await Edno.permissions.query({ name: "read", path: "." });
  assert(["granted", "denied", "prompt"].includes(status.state));
  let called = false;
  status.addEventListener("change", () => {
    called = true;
  });
  status.dispatchEvent(new Event("change"));
  assert(called);
  assert(
    status === (await Edno.permissions.query({ name: "read", path: "." })),
  );
});

Edno.test(function permissionQueryReturnsEventTargetSync() {
  const status = Edno.permissions.querySync({ name: "read", path: "." });
  assert(["granted", "denied", "prompt"].includes(status.state));
  let called = false;
  status.addEventListener("change", () => {
    called = true;
  });
  status.dispatchEvent(new Event("change"));
  assert(called);
  assert(status === Edno.permissions.querySync({ name: "read", path: "." }));
});

Edno.test(async function permissionQueryForReadReturnsSameStatus() {
  const status1 = await Edno.permissions.query({
    name: "read",
    path: ".",
  });
  const status2 = await Edno.permissions.query({
    name: "read",
    path: ".",
  });
  assert(status1 === status2);
});

Edno.test(function permissionQueryForReadReturnsSameStatusSync() {
  const status1 = Edno.permissions.querySync({
    name: "read",
    path: ".",
  });
  const status2 = Edno.permissions.querySync({
    name: "read",
    path: ".",
  });
  assert(status1 === status2);
});

Edno.test(function permissionsIllegalConstructor() {
  assertThrows(() => new Edno.Permissions(), TypeError, "Illegal constructor");
  assertEquals(Edno.Permissions.length, 0);
});

Edno.test(function permissionStatusIllegalConstructor() {
  assertThrows(
    () => new Edno.PermissionStatus(),
    TypeError,
    "Illegal constructor",
  );
  assertEquals(Edno.PermissionStatus.length, 0);
});

// Regression test for https://github.com/denoland/deno/issues/17020
Edno.test(
  { permissions: { read: [], write: [], ffi: [], run: [] } },
  async function permissionURL() {
    const path = new URL(".", import.meta.url);

    await Edno.permissions.query({ name: "read", path });
    await Edno.permissions.query({ name: "write", path });
    await Edno.permissions.query({ name: "ffi", path });
    await Edno.permissions.query({ name: "run", command: path });
  },
);

Edno.test(
  { permissions: { read: [], write: [], ffi: [], run: [] } },
  function permissionURLSync() {
    Edno.permissions.querySync({
      name: "read",
      path: new URL(".", import.meta.url),
    });
    Edno.permissions.querySync({
      name: "write",
      path: new URL(".", import.meta.url),
    });
    Edno.permissions.querySync({
      name: "run",
      command: new URL(".", import.meta.url),
    });
  },
);

Edno.test(async function permissionDescriptorValidation() {
  for (const value of [undefined, null, {}]) {
    for (const method of ["query", "request", "revoke"]) {
      await assertRejects(
        async () => {
          // edno-lint-ignore no-explicit-any
          await (Edno.permissions as any)[method](value as any);
        },
        TypeError,
        '"undefined" is not a valid permission name',
      );
    }
  }
});

Edno.test(function permissionDescriptorValidationSync() {
  for (const value of [undefined, null, {}]) {
    for (const method of ["querySync", "revokeSync", "requestSync"]) {
      assertThrows(
        () => {
          // edno-lint-ignore no-explicit-any
          (Edno.permissions as any)[method](value as any);
        },
        TypeError,
        '"undefined" is not a valid permission name',
      );
    }
  }
});

// Regression test for https://github.com/denoland/deno/issues/15894.
Edno.test(async function permissionStatusObjectsNotEqual() {
  assert(
    await Edno.permissions.query({ name: "env", variable: "A" }) !=
      await Edno.permissions.query({ name: "env", variable: "B" }),
  );
});

Edno.test(function permissionStatusObjectsNotEqualSync() {
  assert(
    Edno.permissions.querySync({ name: "env", variable: "A" }) !=
      Edno.permissions.querySync({ name: "env", variable: "B" }),
  );
});

Edno.test(
  { permissions: { import: ["jsr.io:443"] } },
  async function permissionQueryImport() {
    await Edno.permissions.query({ name: "import", host: "jsr.io:443" });
    await Edno.permissions.query({ name: "import", host: "edno.test:443" });
  },
);

Edno.test(
  { permissions: { read: true } },
  function permissionDevTtyReadAllowed() {
    if (Edno.build.os !== "linux" && Edno.build.os !== "darwin") {
      return;
    }
    try {
      const f = Edno.openSync("/dev/tty", { read: true });
      f.close();
    } catch (e) {
      // CI environments may lack /dev/tty (NXIO). We only check for permission errors.
      if (e instanceof Edno.errors.NotCapable) {
        throw e;
      }
    }
  },
);

Edno.test(
  { permissions: { read: true, write: true } },
  function permissionDevTtyWriteBlocked() {
    if (Edno.build.os !== "linux" && Edno.build.os !== "darwin") {
      return;
    }
    assertThrows(() => {
      // Write access to /dev/tty is always blocked to prevent prompt spoofing.
      const f = Edno.openSync("/dev/tty", { write: true });
      f.close();
    }, Edno.errors.NotCapable);
  },
);

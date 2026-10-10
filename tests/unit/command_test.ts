// Copyright 2018-2026 the Deno authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertStringIncludes,
  assertThrows,
} from "./test_util.ts";

Edno.test(
  { permissions: { write: true, run: true, read: true } },
  async function commandWithCwdIsAsync() {
    const enc = new TextEncoder();
    const cwd = await Edno.makeTempDir({ prefix: "edno_command_test" });

    const exitCodeFileLock = "edno_was_here.lock";
    const exitCodeFile = "edno_was_here";
    const programFile = "poll_exit.ts";
    const program = `
const file = await Edno.open("${exitCodeFileLock}", { write: true, create: true });
async function tryExit() {
  await file.lock(true);
  try {
    const code = parseInt(await Edno.readTextFile("${exitCodeFile}"));
    Edno.exit(code);
  } catch {
    // Retry if we got here before edno wrote the file.
    setTimeout(tryExit, 0.01);
  } finally {
    await file.unlock();
  }
}

tryExit();
`;
    Edno.writeFileSync(`${cwd}/${programFile}`, enc.encode(program));

    const command = new Edno.Command(Edno.execPath(), {
      cwd,
      args: ["run", "-RW", programFile],
      stdout: "inherit",
      stderr: "inherit",
    });
    const child = command.spawn();

    // Write the expected exit code *after* starting edno.
    // This is how we verify that `Child` is actually asynchronous.
    const code = 84;

    await using file = await Edno.open(`${cwd}/${exitCodeFileLock}`, {
      write: true,
      create: true,
    });
    await file.lock(true);
    Edno.writeFileSync(`${cwd}/${exitCodeFile}`, enc.encode(`${code}`));
    await file.unlock();
    const status = await child.status;
    await Edno.remove(cwd, { recursive: true });
    assertEquals(status.code, code);
    assertEquals(status.success, false);
    assertEquals(status.signal, null);
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandStdinPiped() {
    const command = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        `
        const buffer = new Uint8Array(5);
        await Edno.stdin.read(buffer);
        if (new TextDecoder().decode(buffer) !== "hello") {
          throw new Error('Expected \\'hello\\'')
        }
        `,
      ],
      stdin: "piped",
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();

    assertThrows(
      () => child.stdout,
      TypeError,
      "Cannot get 'stdout': 'stdout' is not piped",
    );
    assertThrows(
      () => child.stderr,
      TypeError,
      "Cannot get 'stderr': 'stderr' is not piped",
    );

    const msg = new TextEncoder().encode("hello");
    const writer = child.stdin.getWriter();
    await writer.write(msg);
    writer.releaseLock();

    await child.stdin.close();
    const status = await child.status;
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
    assertEquals(status.signal, null);
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandStdinPiped() {
    const command = new Edno.Command(Edno.execPath(), {
      args: ["info"],
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();

    assertThrows(
      () => child.stdin,
      TypeError,
      "Cannot get 'stdin': 'stdin' is not piped",
    );
    assertThrows(
      () => child.stdout,
      TypeError,
      "Cannot get 'stdout': 'stdout' is not piped",
    );
    assertThrows(
      () => child.stderr,
      TypeError,
      "Cannot get 'stderr': 'stderr' is not piped",
    );

    await child.status;
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandStdoutPiped() {
    const command = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "await Edno.stdout.write(new TextEncoder().encode('hello'))",
      ],
      stderr: "null",
      stdout: "piped",
    });
    const child = command.spawn();

    assertThrows(
      () => child.stdin,
      TypeError,
      "Cannot get 'stdin': 'stdin' is not piped",
    );
    assertThrows(
      () => child.stderr,
      TypeError,
      "Cannot get 'stderr': 'stderr' is not piped",
    );

    const readable = child.stdout.pipeThrough(new TextDecoderStream());
    const reader = readable.getReader();
    const res = await reader.read();
    assert(!res.done);
    assertEquals(res.value, "hello");

    const resEnd = await reader.read();
    assert(resEnd.done);
    assertEquals(resEnd.value, undefined);
    reader.releaseLock();

    const status = await child.status;
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
    assertEquals(status.signal, null);
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandStderrPiped() {
    const command = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "await Edno.stderr.write(new TextEncoder().encode('hello'))",
      ],
      stdout: "null",
      stderr: "piped",
    });
    const child = command.spawn();

    assertThrows(
      () => child.stdin,
      TypeError,
      "Cannot get 'stdin': 'stdin' is not piped",
    );
    assertThrows(
      () => child.stdout,
      TypeError,
      "Cannot get 'stdout': 'stdout' is not piped",
    );

    const readable = child.stderr.pipeThrough(new TextDecoderStream());
    const reader = readable.getReader();
    const res = await reader.read();
    assert(!res.done);
    assertEquals(res.value, "hello");

    const resEnd = await reader.read();
    assert(resEnd.done);
    assertEquals(resEnd.value, undefined);
    reader.releaseLock();

    const status = await child.status;
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
    assertEquals(status.signal, null);
  },
);

Edno.test(
  { permissions: { run: true, write: true, read: true } },
  async function commandRedirectStdoutStderr() {
    const tempDir = await Edno.makeTempDir();
    const fileName = tempDir + "/redirected_stdio.txt";
    const file = await Edno.open(fileName, {
      create: true,
      write: true,
    });

    const command = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "Edno.stderr.write(new TextEncoder().encode('error\\n')); Edno.stdout.write(new TextEncoder().encode('output\\n'));",
      ],
      stdout: "piped",
      stderr: "piped",
    });
    const child = command.spawn();
    await child.stdout.pipeTo(file.writable, {
      preventClose: true,
    });
    await child.stderr.pipeTo(file.writable);
    await child.status;

    const fileContents = await Edno.readFile(fileName);
    const decoder = new TextDecoder();
    const text = decoder.decode(fileContents);

    assertStringIncludes(text, "error");
    assertStringIncludes(text, "output");
  },
);

Edno.test(
  { permissions: { run: true, write: true, read: true } },
  async function commandRedirectStdin() {
    const tempDir = await Edno.makeTempDir();
    const fileName = tempDir + "/redirected_stdio.txt";
    await Edno.writeTextFile(fileName, "hello");
    const file = await Edno.open(fileName);

    const command = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        `
        const buffer = new Uint8Array(5);
        await Edno.stdin.read(buffer);
        if (new TextDecoder().decode(buffer) !== "hello") {
          throw new Error('Expected \\'hello\\'')
        }
        `,
      ],
      stdin: "piped",
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();
    await file.readable.pipeTo(child.stdin, {
      preventClose: true,
    });

    await child.stdin.close();
    const status = await child.status;
    assertEquals(status.code, 0);
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandKillSuccess() {
    const command = new Edno.Command(Edno.execPath(), {
      args: ["eval", "setTimeout(() => {}, 10000)"],
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();

    child.kill("SIGKILL");
    const status = await child.status;

    assertEquals(status.success, false);
    if (Edno.build.os === "windows") {
      assertEquals(status.code, 1);
      assertEquals(status.signal, null);
    } else {
      assertEquals(status.code, 137);
      assertEquals(status.signal, "SIGKILL");
    }
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function childProcessExplicitResourceManagement() {
    let dead = undefined;
    {
      const command = new Edno.Command(Edno.execPath(), {
        args: ["eval", "setTimeout(() => {}, 10000)"],
        stdout: "null",
        stderr: "null",
      });
      await using child = command.spawn();
      child.status.then(({ signal }) => {
        dead = signal;
      });
    }

    if (Edno.build.os == "windows") {
      assertEquals(dead, null);
    } else {
      assertEquals(dead, "SIGTERM");
    }
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function childProcessExplicitResourceManagementManualClose() {
    const command = new Edno.Command(Edno.execPath(), {
      args: ["eval", "setTimeout(() => {}, 10000)"],
      stdout: "null",
      stderr: "null",
    });
    await using child = command.spawn();
    child.kill("SIGTERM");
    await child.status;
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandKillFailed() {
    const command = new Edno.Command(Edno.execPath(), {
      args: ["eval", "setTimeout(() => {}, 5000)"],
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();

    assertThrows(() => {
      // @ts-expect-error testing runtime error of bad signal
      child.kill("foobar");
    }, TypeError);

    await child.status;
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandKillOptional() {
    const command = new Edno.Command(Edno.execPath(), {
      args: ["eval", "setTimeout(() => {}, 10000)"],
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();

    child.kill();
    const status = await child.status;

    assertEquals(status.success, false);
    if (Edno.build.os === "windows") {
      assertEquals(status.code, 1);
      assertEquals(status.signal, null);
    } else {
      assertEquals(status.code, 143);
      assertEquals(status.signal, "SIGTERM");
    }
  },
);

Edno.test(
  {
    permissions: { run: true, read: true },
    ignore: Edno.build.os === "windows",
  },
  async function commandKillWithIntegerSignal() {
    const command = new Edno.Command(Edno.execPath(), {
      args: ["eval", "setTimeout(() => {}, 10000)"],
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();

    // Kill with integer signal (9 = SIGKILL)
    child.kill(9);
    const status = await child.status;

    assertEquals(status.success, false);
    assertEquals(status.code, 137);
    assertEquals(status.signal, "SIGKILL");
  },
);

Edno.test(
  {
    permissions: { run: true, read: true },
    ignore: Edno.build.os === "windows",
  },
  async function commandKillWithSignalZero() {
    const command = new Edno.Command(Edno.execPath(), {
      args: ["eval", "setTimeout(() => {}, 10000)"],
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();

    // Signal 0 checks if the process exists
    child.kill(0); // Should not actually kill the process

    // Now kill it for real
    child.kill("SIGTERM");
    const status = await child.status;

    assertEquals(status.success, false);
    assertEquals(status.code, 143);
    assertEquals(status.signal, "SIGTERM");
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandAbort() {
    const ac = new AbortController();
    const command = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "setTimeout(console.log, 1e8)",
      ],
      signal: ac.signal,
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();
    queueMicrotask(() => ac.abort());
    const status = await child.status;
    assertEquals(status.success, false);
    if (Edno.build.os === "windows") {
      assertEquals(status.code, 1);
      assertEquals(status.signal, null);
    } else {
      assertEquals(status.success, false);
      assertEquals(status.code, 143);
    }
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandOutputAbort() {
    const ac = new AbortController();
    const command = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "setTimeout(console.log, 1e8)",
      ],
      signal: ac.signal,
      stdout: "null",
      stderr: "null",
    });
    const start = performance.now();
    queueMicrotask(() => ac.abort());
    const output = await command.output();
    const duration = performance.now() - start;
    assert(
      duration < 5000,
      `Expected output() to be aborted promptly, but ran for ${
        duration.toFixed(2)
      }ms`,
    );
    assertEquals(output.success, false);
    if (Edno.build.os === "windows") {
      assertEquals(output.code, 1);
      assertEquals(output.signal, null);
    } else {
      assertEquals(output.code, 143);
    }
  },
);

Edno.test(
  { permissions: { read: true, run: false } },
  async function commandPermissions() {
    await assertRejects(async () => {
      await new Edno.Command(Edno.execPath(), {
        args: ["eval", "console.log('hello world')"],
      }).output();
    }, Edno.errors.NotCapable);
  },
);

Edno.test(
  { permissions: { read: true, run: false } },
  function commandSyncPermissions() {
    assertThrows(() => {
      new Edno.Command(Edno.execPath(), {
        args: ["eval", "console.log('hello world')"],
      }).outputSync();
    }, Edno.errors.NotCapable);
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandSuccess() {
    const output = await new Edno.Command(Edno.execPath(), {
      args: ["eval", "console.log('hello world')"],
    }).output();

    assertEquals(output.success, true);
    assertEquals(output.code, 0);
    assertEquals(output.signal, null);
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  function commandSyncSuccess() {
    const output = new Edno.Command(Edno.execPath(), {
      args: ["eval", "console.log('hello world')"],
    }).outputSync();

    assertEquals(output.success, true);
    assertEquals(output.code, 0);
    assertEquals(output.signal, null);
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandUrl() {
    const output = await new Edno.Command(
      new URL(`file:///${Edno.execPath()}`),
      {
        args: ["eval", "console.log('hello world')"],
      },
    ).output();

    assertEquals(new TextDecoder().decode(output.stdout), "hello world\n");

    assertEquals(output.success, true);
    assertEquals(output.code, 0);
    assertEquals(output.signal, null);
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  function commandSyncUrl() {
    const output = new Edno.Command(
      new URL(`file:///${Edno.execPath()}`),
      {
        args: ["eval", "console.log('hello world')"],
      },
    ).outputSync();

    assertEquals(new TextDecoder().decode(output.stdout), "hello world\n");

    assertEquals(output.success, true);
    assertEquals(output.code, 0);
    assertEquals(output.signal, null);
  },
);

Edno.test({ permissions: { run: true } }, function commandNotFound() {
  assertThrows(
    () => new Edno.Command("this file hopefully doesn't exist").output(),
    Edno.errors.NotFound,
  );
});

Edno.test({ permissions: { run: true } }, function commandSyncNotFound() {
  assertThrows(
    () => new Edno.Command("this file hopefully doesn't exist").outputSync(),
    Edno.errors.NotFound,
  );
});

Edno.test({ permissions: { run: true, read: true } }, function cwdNotFound() {
  assertThrows(
    () =>
      new Edno.Command(Edno.execPath(), {
        cwd: Edno.cwd() + "/non-existent-directory",
      }).output(),
    Edno.errors.NotFound,
    "No such cwd",
  );
});

Edno.test(
  { permissions: { run: true, read: true } },
  function cwdNotDirectory() {
    assertThrows(
      () =>
        new Edno.Command(Edno.execPath(), {
          cwd: Edno.execPath(),
        }).output(),
      Edno.errors.NotFound,
      "cwd is not a directory",
    );
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandFailedWithCode() {
    const output = await new Edno.Command(Edno.execPath(), {
      args: ["eval", "Edno.exit(41 + 1)"],
    }).output();
    assertEquals(output.success, false);
    assertEquals(output.code, 42);
    assertEquals(output.signal, null);
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  function commandSyncFailedWithCode() {
    const output = new Edno.Command(Edno.execPath(), {
      args: ["eval", "Edno.exit(41 + 1)"],
    }).outputSync();
    assertEquals(output.success, false);
    assertEquals(output.code, 42);
    assertEquals(output.signal, null);
  },
);

Edno.test(
  {
    permissions: { run: true, read: true },
  },
  async function commandFailedWithSignal() {
    const output = await new Edno.Command(Edno.execPath(), {
      args: ["eval", "Edno.kill(Edno.pid, 'SIGKILL')"],
    }).output();
    assertEquals(output.success, false);
    if (Edno.build.os === "windows") {
      assertEquals(output.code, 1);
      assertEquals(output.signal, null);
    } else {
      assertEquals(output.code, 128 + 9);
      assertEquals(output.signal, "SIGKILL");
    }
  },
);

Edno.test(
  {
    permissions: { run: true, read: true },
  },
  function commandSyncFailedWithSignal() {
    const output = new Edno.Command(Edno.execPath(), {
      args: ["eval", "Edno.kill(Edno.pid, 'SIGKILL')"],
    }).outputSync();
    assertEquals(output.success, false);
    if (Edno.build.os === "windows") {
      assertEquals(output.code, 1);
      assertEquals(output.signal, null);
    } else {
      assertEquals(output.code, 128 + 9);
      assertEquals(output.signal, "SIGKILL");
    }
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandOutput() {
    const { stdout } = await new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "await Edno.stdout.write(new TextEncoder().encode('hello'))",
      ],
    }).output();

    const s = new TextDecoder().decode(stdout);
    assertEquals(s, "hello");
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  function commandSyncOutput() {
    const { stdout } = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "await Edno.stdout.write(new TextEncoder().encode('hello'))",
      ],
    }).outputSync();

    const s = new TextDecoder().decode(stdout);
    assertEquals(s, "hello");
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandStderrOutput() {
    const { stderr } = await new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "await Edno.stderr.write(new TextEncoder().encode('error'))",
      ],
    }).output();

    const s = new TextDecoder().decode(stderr);
    assertEquals(s, "error");
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  function commandSyncStderrOutput() {
    const { stderr } = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "await Edno.stderr.write(new TextEncoder().encode('error'))",
      ],
    }).outputSync();

    const s = new TextDecoder().decode(stderr);
    assertEquals(s, "error");
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandEnv() {
    const { stdout } = await new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "Edno.stdout.write(new TextEncoder().encode(Edno.env.get('FOO') + Edno.env.get('BAR')))",
      ],
      env: {
        FOO: "0123",
        BAR: "4567",
      },
    }).output();
    const s = new TextDecoder().decode(stdout);
    assertEquals(s, "01234567");
  },
);

Edno.test(
  {
    ignore: Edno.build.os === "windows",
    permissions: { run: [Edno.execPath()], read: true },
  },
  function commandLoaderEnvValueValidation() {
    for (const name of ["LD_PRELOAD", "DYLD_INSERT_LIBRARIES"]) {
      const command = (value: string) =>
        new Edno.Command(Edno.execPath(), {
          args: ["eval", ""],
          clearEnv: true,
          env: { [name]: value },
        });

      assertEquals(command("").outputSync().success, true);
      assertThrows(
        () => command("\t").outputSync(),
        Edno.errors.NotCapable,
        name,
      );
    }
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  function commandSyncEnv() {
    const { stdout } = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "Edno.stdout.write(new TextEncoder().encode(Edno.env.get('FOO') + Edno.env.get('BAR')))",
      ],
      env: {
        FOO: "0123",
        BAR: "4567",
      },
    }).outputSync();
    const s = new TextDecoder().decode(stdout);
    assertEquals(s, "01234567");
  },
);

Edno.test(
  { permissions: { run: true, read: true, env: true } },
  async function commandClearEnv() {
    Edno.env.set("EDNO_COMMAND_CLEAR_ENV_TESTING", "TESTING");
    const { stdout } = await new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "-p",
        "JSON.stringify(Edno.env.toObject())",
      ],
      clearEnv: true,
      env: {
        FOO: "23147",
      },
    }).output();

    const obj = JSON.parse(new TextDecoder().decode(stdout));

    // can't check for object equality because the OS may set additional env
    // vars for processes, so we check if PATH isn't present as that is a common
    // env var across OS's and isn't set for processes.
    assertEquals(obj.FOO, "23147");
    assert(!("EDNO_COMMAND_CLEAR_ENV_TESTING" in obj));
    Edno.env.delete("EDNO_COMMAND_CLEAR_ENV_TESTING");
  },
);

Edno.test(
  { permissions: { run: true, read: true, env: true } },
  function commandSyncClearEnv() {
    Edno.env.set("EDNO_COMMAND_SYNC_CLEAR_ENV_TESTING", "TESTING");
    const { stdout } = new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "-p",
        "JSON.stringify(Edno.env.toObject())",
      ],
      clearEnv: true,
      env: {
        FOO: "23147",
      },
    }).outputSync();

    const obj = JSON.parse(new TextDecoder().decode(stdout));

    // can't check for object equality because the OS may set additional env
    // vars for processes, so we check if PATH isn't present as that is a common
    // env var across OS's and isn't set for processes.
    assertEquals(obj.FOO, "23147");
    assert(!("EDNO_COMMAND_SYNC_CLEAR_ENV_TESTING" in obj));
    Edno.env.delete("EDNO_COMMAND_SYNC_CLEAR_ENV_TESTING");
  },
);

Edno.test(
  {
    permissions: { run: true, read: true },
    ignore: Edno.build.os === "windows",
  },
  async function commandUid() {
    const { stdout } = await new Edno.Command("id", {
      args: ["-u"],
    }).output();

    const currentUid = new TextDecoder().decode(stdout).trim();
    const sameUid = await new Edno.Command("id", {
      args: ["-u"],
      uid: Number(currentUid),
    }).output();
    assertEquals(new TextDecoder().decode(sameUid.stdout).trim(), currentUid);

    if (currentUid !== "0") {
      await assertRejects(async () => {
        await new Edno.Command("echo", {
          args: ["fhqwhgads"],
          uid: 0,
        }).output();
      }, Edno.errors.PermissionDenied);
    }
  },
);

Edno.test(
  {
    permissions: { run: true, read: true, write: true },
    ignore: Edno.build.os !== "windows",
  },
  async function rejectBatAndCmdFiles() {
    const tempDir = await Edno.makeTempDir();
    Edno.writeTextFileSync(tempDir + "/test.bat", "@echo off\r\necho 1 2 3 %*");
    for (
      const ext of [
        ".bat",
        ".BaT",
        ".bAT",
        ".BAT",
        ".bat.",
        ".bat  ",
        ".bat . ",
      ]
    ) {
      const fileName = tempDir + "/test" + ext;
      const output = await new Edno.Command(fileName, {
        args: ["&calc.exe"],
        stdout: "piped",
      }).output();
      const stdout = new TextDecoder().decode(output.stdout);
      // should have calc escaped here instead of executing it
      assert(stdout.includes(`1 2 3 "&calc.exe\"`), `Text: ${stdout}`);
    }
  },
);

Edno.test(
  {
    permissions: { run: true, read: true },
    ignore: Edno.build.os === "windows",
  },
  function commandSyncUid() {
    const { stdout } = new Edno.Command("id", {
      args: ["-u"],
    }).outputSync();

    const currentUid = new TextDecoder().decode(stdout).trim();
    const sameUid = new Edno.Command("id", {
      args: ["-u"],
      uid: Number(currentUid),
    }).outputSync();
    assertEquals(new TextDecoder().decode(sameUid.stdout).trim(), currentUid);

    if (currentUid !== "0") {
      assertThrows(() => {
        new Edno.Command("echo", {
          args: ["fhqwhgads"],
          uid: 0,
        }).outputSync();
      }, Edno.errors.PermissionDenied);
    }
  },
);

Edno.test(
  {
    permissions: { run: true, read: true },
    ignore: Edno.build.os === "windows",
  },
  async function commandGid() {
    const { stdout } = await new Edno.Command("id", {
      args: ["-g"],
    }).output();

    const currentGid = new TextDecoder().decode(stdout).trim();
    const sameGid = await new Edno.Command("id", {
      args: ["-g"],
      gid: Number(currentGid),
    }).output();
    assertEquals(new TextDecoder().decode(sameGid.stdout).trim(), currentGid);

    if (currentGid !== "0") {
      await assertRejects(async () => {
        await new Edno.Command("echo", {
          args: ["fhqwhgads"],
          gid: 0,
        }).output();
      }, Edno.errors.PermissionDenied);
    }
  },
);

Edno.test(
  {
    permissions: { run: true, read: true },
    ignore: Edno.build.os === "windows",
  },
  function commandSyncGid() {
    const { stdout } = new Edno.Command("id", {
      args: ["-g"],
    }).outputSync();

    const currentGid = new TextDecoder().decode(stdout).trim();
    const sameGid = new Edno.Command("id", {
      args: ["-g"],
      gid: Number(currentGid),
    }).outputSync();
    assertEquals(new TextDecoder().decode(sameGid.stdout).trim(), currentGid);

    if (currentGid !== "0") {
      assertThrows(() => {
        new Edno.Command("echo", {
          args: ["fhqwhgads"],
          gid: 0,
        }).outputSync();
      }, Edno.errors.PermissionDenied);
    }
  },
);

Edno.test(function commandStdinPipedFails() {
  assertThrows(
    () =>
      new Edno.Command("id", {
        stdin: "piped",
      }).output(),
    TypeError,
    "Piped stdin is not supported for this function, use 'Edno.Command.spawn()' instead",
  );
});

Edno.test(function spawnSyncStdinPipedFails() {
  assertThrows(
    () =>
      new Edno.Command("id", {
        stdin: "piped",
      }).outputSync(),
    TypeError,
    "Piped stdin is not supported for this function, use 'Edno.Command.spawn()' instead",
  );
});

Edno.test(
  // FIXME(bartlomieju): this test is very flaky on CI, fix it
  {
    ignore: true,
    permissions: { write: true, run: true, read: true },
  },
  async function commandChildUnref() {
    const enc = new TextEncoder();
    const cwd = await Edno.makeTempDir({ prefix: "edno_command_test" });

    const programFile = "unref.ts";
    const program = `
const command = await new Edno.Command(Edno.execPath(), {
  cwd: Edno.args[0],
  stdout: "piped",
  args: ["run", "-A", Edno.args[1]],
});
const child = command.spawn();
const readable = child.stdout.pipeThrough(new TextDecoderStream());
const reader = readable.getReader();
// set up an interval that will end after reading a few messages from stdout,
// to verify that stdio streams are properly unrefed
let count = 0;
let interval;
interval = setInterval(async () => {
  count += 1;
  if (count > 10) {
    clearInterval(interval);
    console.log("cleared interval");
  }
  const res = await reader.read();
  if (res.done) {
    throw new Error("stream shouldn't be done");
  }
  if (res.value.trim() != "hello from interval") {
    throw new Error("invalid message received");
  }
}, 120);
console.log("spawned pid", child.pid);
child.unref();
`;

    const childProgramFile = "unref_child.ts";
    const childProgram = `
setInterval(() => {
  console.log("hello from interval");
}, 100);
`;
    Edno.writeFileSync(`${cwd}/${programFile}`, enc.encode(program));
    Edno.writeFileSync(`${cwd}/${childProgramFile}`, enc.encode(childProgram));
    // In this subprocess we are spawning another subprocess which has
    // an infinite interval set. Following call would never resolve unless
    // child process gets unrefed.
    const { success, stdout, stderr } = await new Edno.Command(
      Edno.execPath(),
      {
        cwd,
        args: ["run", "-A", programFile, cwd, childProgramFile],
      },
    ).output();

    assert(success);
    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);
    assert(stderrText.length == 0);
    const [line1, line2] = stdoutText.split("\n");
    const pidStr = line1.split(" ").at(-1);
    assert(pidStr);
    assertEquals(line2, "cleared interval");
    const pid = Number.parseInt(pidStr, 10);
    await Edno.remove(cwd, { recursive: true });
    // Child process should have been killed when parent process exits.
    assertThrows(() => {
      Edno.kill(pid, "SIGTERM");
    }, Edno.errors.NotFound);
  },
);

Edno.test(
  { ignore: Edno.build.os !== "windows" },
  async function commandWindowsRawArguments() {
    let { success, stdout } = await new Edno.Command("cmd", {
      args: ["/d", "/s", "/c", '"edno ^"--version^""'],
      windowsRawArguments: true,
    }).output();
    assert(success);
    let stdoutText = new TextDecoder().decode(stdout);
    assertStringIncludes(stdoutText, "edno");
    assertStringIncludes(stdoutText, "v8");
    assertStringIncludes(stdoutText, "typescript");

    ({ success, stdout } = new Edno.Command("cmd", {
      args: ["/d", "/s", "/c", '"edno ^"--version^""'],
      windowsRawArguments: true,
    }).outputSync());
    assert(success);
    stdoutText = new TextDecoder().decode(stdout);
    assertStringIncludes(stdoutText, "edno");
    assertStringIncludes(stdoutText, "v8");
    assertStringIncludes(stdoutText, "typescript");
  },
);

Edno.test(
  { permissions: { read: true, run: true } },
  async function commandWithPrototypePollution() {
    const originalThen = Promise.prototype.then;
    const originalSymbolIterator = Array.prototype[Symbol.iterator];
    try {
      Promise.prototype.then = Array.prototype[Symbol.iterator] = () => {
        throw new Error();
      };
      await new Edno.Command(Edno.execPath(), {
        args: ["eval", "console.log('hello world')"],
      }).output();
    } finally {
      Promise.prototype.then = originalThen;
      Array.prototype[Symbol.iterator] = originalSymbolIterator;
    }
  },
);

Edno.test(
  { permissions: { run: true, read: true } },
  async function commandKillAfterStatus() {
    const command = new Edno.Command(Edno.execPath(), {
      args: ["help"],
      stdout: "null",
      stderr: "null",
    });
    const child = command.spawn();
    await child.status;
    assertThrows(
      () => child.kill(),
      TypeError,
      "Child process has already terminated",
    );
  },
);

Edno.test(
  "process that fails to spawn, prints its name in error",
  async () => {
    assertThrows(
      () => new Edno.Command("doesntexist").outputSync(),
      Error,
      "Failed to spawn 'doesntexist'",
    );
    await assertRejects(
      async () => await new Edno.Command("doesntexist").output(),
      Error,
      "Failed to spawn 'doesntexist'",
    );
  },
);

Edno.test(
  { permissions: { write: true, run: true, read: true } },
  async function commandWithCwdOrPath() {
    const cwd = Edno.makeTempDirSync({ prefix: "edno_command_test" });
    try {
      const suffix = Edno.build.os === "windows" ? ".exe" : "";
      Edno.mkdirSync(`${cwd}/subdir`);
      Edno.copyFileSync(Edno.execPath(), `${cwd}/subdir/my_binary${suffix}`);
      // cwd
      {
        const output = await new Edno.Command(`./my_binary${suffix}`, {
          cwd: `${cwd}/subdir`,
          args: ["-v"],
        }).output();
        assertEquals(output.success, true);
      }
      // path
      {
        const output = await new Edno.Command(`my_binary${suffix}`, {
          env: {
            PATH: `${cwd}/subdir`,
          },
          args: ["-v"],
        }).output();
        assertEquals(output.success, true);
      }
    } finally {
      Edno.removeSync(cwd, { recursive: true });
    }
  },
);

Edno.test(async function outputWhenManuallyConsumingStreams() {
  const command = new Edno.Command(Edno.execPath(), {
    args: ["eval", "console.log('hello world')"],
    stdout: "piped",
    stderr: "piped",
  });
  const child = command.spawn();
  for await (const _ of child.stdout) {
    // consume stdout
  }
  for await (const _ of child.stderr) {
    // consume stderr
  }
  const status = await child.output();
  assertEquals(status.success, true);
  assertEquals(status.code, 0);
  assertEquals(status.signal, null);
  assertEquals(status.stdout, new Uint8Array());
  assertEquals(status.stderr, new Uint8Array());
});

Edno.test(
  {
    ignore: Edno.build.os !== "windows",
    permissions: { run: ["cmd"], read: true, env: true },
  },
  async function envCaseInsensitiveWindows() {
    const command = new Edno.Command("cmd", {
      args: ["/d", "/s", "/c", "echo", "1"],
      env: {
        // notice Path is not PATH
        Path: Edno.env.get("PATH")!,
      },
      clearEnv: true,
    });
    const child = await command.output();
    assertEquals(child.success, true);
  },
);

Edno.test(
  { ignore: Edno.build.os === "windows" },
  async function abortChildProcessRightWhenItExitsShouldNotThrow() {
    const controller = new AbortController();
    const cb = () => controller.abort();
    Edno.addSignalListener("SIGCHLD", cb);
    const output = await new Edno.Command("true", { signal: controller.signal })
      .output();
    assertEquals(output.success, true);
    assertEquals(output.code, 0);
    assertEquals(output.signal, null);
    assertEquals(output.stdout, new Uint8Array());
    assertEquals(output.stderr, new Uint8Array());

    Edno.removeSignalListener("SIGCHLD", cb);
  },
);

Edno.test({ permissions: { run: true } }, async function collectArrayBuffer() {
  const process = new Edno.Command(Edno.execPath(), {
    args: ["eval", "console.log('hello')"],
    stdout: "piped",
  }).spawn();

  const output = await process.stdout.arrayBuffer();
  assert(output instanceof ArrayBuffer);
  assertEquals(
    new Uint8Array(output),
    new Uint8Array([104, 101, 108, 108, 111, 10]),
  );

  await process.status;
});

Edno.test({ permissions: { run: true } }, async function collectBytes() {
  const process = new Edno.Command(Edno.execPath(), {
    args: ["eval", "console.log('hello')"],
    stdout: "piped",
  }).spawn();

  const output = await process.stdout.bytes();
  assert(output instanceof Uint8Array);
  assertEquals(output, new Uint8Array([104, 101, 108, 108, 111, 10]));

  await process.status;
});

Edno.test({ permissions: { run: true } }, async function collectJSON() {
  const process = new Edno.Command(Edno.execPath(), {
    args: ["eval", "console.log(JSON.stringify({foo: 'bar'}))"],
    stdout: "piped",
  }).spawn();

  const output = await process.stdout.json();
  assertEquals(output, { foo: "bar" });

  await process.status;
});

Edno.test({ permissions: { run: true } }, async function collectText() {
  const process = new Edno.Command(Edno.execPath(), {
    args: ["eval", "console.log('hello')"],
    stdout: "piped",
  }).spawn();

  const output = await process.stdout.text();
  assertEquals(output, "hello\n");

  await process.status;
});

Edno.test(
  { permissions: { run: true } },
  async function ednoSpawnBasic() {
    const child = Edno.spawn(Edno.execPath(), {
      args: ["eval", "console.log('hello from spawn')"],
      stdout: "piped",
      stderr: "null",
    });

    assert(child instanceof Edno.ChildProcess);
    assert(child.pid > 0);

    const output = await child.stdout.text();
    assertEquals(output, "hello from spawn\n");

    const status = await child.status;
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
  },
);

Edno.test(
  { permissions: { run: true } },
  async function ednoSpawnDefaultsToInherit() {
    // Edno.spawn should default stdio to "inherit" like Command.spawn()
    const child = Edno.spawn(Edno.execPath(), {
      args: ["eval", "Edno.exit(42)"],
    });

    const status = await child.status;
    assertEquals(status.success, false);
    assertEquals(status.code, 42);
  },
);

Edno.test(
  { permissions: { run: true } },
  async function ednoSpawnWithPipedStdin() {
    const child = Edno.spawn(Edno.execPath(), {
      args: [
        "eval",
        "const buf = new Uint8Array(5); await Edno.stdin.read(buf); console.log(new TextDecoder().decode(buf))",
      ],
      stdin: "piped",
      stdout: "piped",
      stderr: "null",
    });

    const writer = child.stdin.getWriter();
    await writer.write(new TextEncoder().encode("hello"));
    await writer.close();

    const output = await child.stdout.text();
    assertEquals(output, "hello\n");

    const status = await child.status;
    assertEquals(status.success, true);
  },
);

Edno.test(
  { permissions: { run: true } },
  async function ednoSpawnWithArgsArray() {
    const child = Edno.spawn(
      Edno.execPath(),
      ["eval", "console.log('args overload')"],
      { stdout: "piped", stderr: "null" },
    );

    const output = await child.stdout.text();
    assertEquals(output, "args overload\n");

    const status = await child.status;
    assertEquals(status.success, true);
    assertEquals(status.code, 0);
  },
);

Edno.test(
  { permissions: { run: true } },
  function ednoSpawnWithArgsArrayAndArgsOptionThrows() {
    assertThrows(
      () => {
        Edno.spawn(
          Edno.execPath(),
          ["eval", "console.log('hello')"],
          // @ts-expect-error - args not allowed when using args array overload
          { args: ["eval", "console.log('hello')"], stdout: "null" },
        );
      },
      TypeError,
      "Passing 'args' in options is not allowed when args are passed as a separate argument",
    );
  },
);

Edno.test(
  { permissions: { run: true } },
  async function ednoSpawnAndWaitBasic() {
    const { code, stdout, stderr } = await Edno.spawnAndWait(
      Edno.execPath(),
      {
        args: ["eval", "console.log('waited')"],
      },
    );

    assertEquals(code, 0);
    assertEquals(new TextDecoder().decode(stdout), "waited\n");
    assertEquals(new TextDecoder().decode(stderr), "");
  },
);

Edno.test(
  { permissions: { run: true } },
  async function ednoSpawnAndWaitWithArgsArray() {
    const { code, stdout } = await Edno.spawnAndWait(
      Edno.execPath(),
      ["eval", "console.log('args overload waited')"],
    );

    assertEquals(code, 0);
    assertEquals(new TextDecoder().decode(stdout), "args overload waited\n");
  },
);

Edno.test(
  { permissions: { run: true } },
  async function ednoSpawnAndWaitExitCode() {
    const { code, success } = await Edno.spawnAndWait(
      Edno.execPath(),
      ["eval", "Edno.exit(42)"],
    );

    assertEquals(success, false);
    assertEquals(code, 42);
  },
);

Edno.test(
  { permissions: { run: true } },
  function ednoSpawnAndWaitPipedStdinThrows() {
    assertThrows(
      () => {
        Edno.spawnAndWait(Edno.execPath(), {
          args: ["eval", "console.log('hello')"],
          stdin: "piped",
        });
      },
      TypeError,
      "Piped stdin is not supported for this function",
    );
  },
);

Edno.test(
  { permissions: { run: true } },
  function ednoSpawnAndWaitWithArgsArrayAndArgsOptionThrows() {
    assertThrows(
      () => {
        Edno.spawnAndWait(
          Edno.execPath(),
          ["eval", "console.log('hello')"],
          // @ts-expect-error - args not allowed when using args array overload
          { args: ["eval", "console.log('hello')"] },
        );
      },
      TypeError,
      "Passing 'args' in options is not allowed when args are passed as a separate argument",
    );
  },
);

Edno.test(
  { permissions: { run: true } },
  function ednoSpawnAndWaitSyncBasic() {
    const { code, stdout, stderr } = Edno.spawnAndWaitSync(
      Edno.execPath(),
      {
        args: ["eval", "console.log('sync waited')"],
      },
    );

    assertEquals(code, 0);
    assertEquals(new TextDecoder().decode(stdout), "sync waited\n");
    assertEquals(new TextDecoder().decode(stderr), "");
  },
);

Edno.test(
  { permissions: { run: true } },
  function ednoSpawnAndWaitSyncWithArgsArray() {
    const { code, stdout } = Edno.spawnAndWaitSync(
      Edno.execPath(),
      ["eval", "console.log('sync args overload')"],
    );

    assertEquals(code, 0);
    assertEquals(
      new TextDecoder().decode(stdout),
      "sync args overload\n",
    );
  },
);

Edno.test(
  { permissions: { run: true } },
  function ednoSpawnAndWaitSyncExitCode() {
    const { code, success } = Edno.spawnAndWaitSync(
      Edno.execPath(),
      ["eval", "Edno.exit(42)"],
    );

    assertEquals(success, false);
    assertEquals(code, 42);
  },
);

Edno.test(
  { permissions: { run: true } },
  function ednoSpawnAndWaitSyncPipedStdinThrows() {
    assertThrows(
      () => {
        Edno.spawnAndWaitSync(Edno.execPath(), {
          args: ["eval", "console.log('hello')"],
          stdin: "piped",
        });
      },
      TypeError,
      "Piped stdin is not supported for this function",
    );
  },
);

Edno.test(
  { permissions: { run: true } },
  function ednoSpawnAndWaitSyncWithArgsArrayAndArgsOptionThrows() {
    assertThrows(
      () => {
        Edno.spawnAndWaitSync(
          Edno.execPath(),
          ["eval", "console.log('hello')"],
          // @ts-expect-error - args not allowed when using args array overload
          { args: ["eval", "console.log('hello')"] },
        );
      },
      TypeError,
      "Passing 'args' in options is not allowed when args are passed as a separate argument",
    );
  },
);

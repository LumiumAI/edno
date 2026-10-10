// Copyright 2018-2026 the Deno authors. MIT license.
import { assertEquals, assertThrows, delay } from "./test_util.ts";

Edno.test(
  { ignore: Edno.build.os !== "windows" },
  function windowsUnsupportedSignalsTest() {
    // These signals are Unix-only and not supported on Windows at all.
    const unsupported = [
      "SIGALRM",
      "SIGCHLD",
      "SIGFPE",
      "SIGILL",
      "SIGIO",
      "SIGPIPE",
      "SIGSEGV",
      "SIGUSR1",
      "SIGUSR2",
    ];
    for (const sig of unsupported) {
      assertThrows(
        () => {
          Edno.addSignalListener(sig as Edno.Signal, () => {});
        },
        Error,
        `Invalid signal: ${sig}`,
      );
    }
  },
);

Edno.test(
  { ignore: Edno.build.os !== "windows" },
  function windowsForbiddenSignalsTest() {
    // These signals exist on Windows but are forbidden to listen for
    // (uncatchable/fatal signals).
    assertThrows(
      () => Edno.addSignalListener("SIGKILL", () => {}),
      TypeError,
      "Binding to signal 'SIGKILL' is not allowed",
    );
    assertThrows(
      () => Edno.addSignalListener("SIGABRT", () => {}),
      TypeError,
      "Binding to signal 'SIGABRT' is not allowed",
    );
  },
);

Edno.test(
  { ignore: Edno.build.os !== "windows" },
  function windowsSupportedSignalsTest() {
    // These signals should be registerable on Windows.
    const supported: Edno.Signal[] = [
      "SIGINT",
      "SIGBREAK",
      "SIGHUP",
      "SIGTERM",
      "SIGQUIT",
      "SIGWINCH",
    ];
    for (const sig of supported) {
      const listener = () => {};
      Edno.addSignalListener(sig, listener);
      Edno.removeSignalListener(sig, listener);
    }
  },
);

Edno.test(
  {
    ignore: Edno.build.os === "windows",
    permissions: { run: true },
  },
  async function signalListenerTest() {
    let c = 0;
    const listener = () => {
      c += 1;
    };
    // This test needs to be careful that it doesn't accidentally aggregate multiple
    // signals into one. Sending two or more SIGxxx before the handler can be run will
    // result in signal coalescing.
    Edno.addSignalListener("SIGUSR1", listener);
    // Sends SIGUSR1 3 times.
    for (let i = 1; i <= 3; i++) {
      await delay(1);
      Edno.kill(Edno.pid, "SIGUSR1");
      while (c < i) {
        await delay(20);
      }
    }
    Edno.removeSignalListener("SIGUSR1", listener);
    await delay(100);
    assertEquals(c, 3);
  },
);

Edno.test(
  {
    ignore: Edno.build.os === "windows",
    permissions: { run: true },
  },
  async function multipleSignalListenerTest() {
    let c = "";
    const listener0 = () => {
      c += "0";
    };
    const listener1 = () => {
      c += "1";
    };
    // This test needs to be careful that it doesn't accidentally aggregate multiple
    // signals into one. Sending two or more SIGxxx before the handler can be run will
    // result in signal coalescing.
    Edno.addSignalListener("SIGUSR2", listener0);
    Edno.addSignalListener("SIGUSR2", listener1);

    // Sends SIGUSR2 3 times.
    for (let i = 1; i <= 3; i++) {
      await delay(1);
      Edno.kill(Edno.pid, "SIGUSR2");
      while (c.length < i * 2) {
        await delay(20);
      }
    }

    Edno.removeSignalListener("SIGUSR2", listener1);

    // Sends SIGUSR2 3 times.
    for (let i = 1; i <= 3; i++) {
      await delay(1);
      Edno.kill(Edno.pid, "SIGUSR2");
      while (c.length < 6 + i) {
        await delay(20);
      }
    }

    // Sends SIGUSR1 (irrelevant signal) 3 times.
    // By default SIGUSR1 terminates, so set it to a no-op for this test.
    let count = 0;
    const irrelevant = () => {
      count++;
    };
    Edno.addSignalListener("SIGUSR1", irrelevant);
    for (const _ of Array(3)) {
      await delay(20);
      Edno.kill(Edno.pid, "SIGUSR1");
    }
    while (count < 3) {
      await delay(20);
    }
    Edno.removeSignalListener("SIGUSR1", irrelevant);

    // No change
    assertEquals(c, "010101000");

    Edno.removeSignalListener("SIGUSR2", listener0);

    await delay(100);

    // The first 3 events are handled by both handlers
    // The last 3 events are handled only by handler0
    assertEquals(c, "010101000");
  },
);

// This tests that pending op_signal_poll doesn't block the runtime from exiting the process.
Edno.test(
  {
    permissions: { run: true, read: true },
  },
  async function canExitWhileListeningToSignal() {
    const { code } = await new Edno.Command(Edno.execPath(), {
      args: [
        "eval",
        "Edno.addSignalListener('SIGINT', () => {})",
      ],
    }).output();
    assertEquals(code, 0);
  },
);

Edno.test(
  {
    ignore: Edno.build.os === "windows",
    permissions: { run: true },
  },
  async function workerSignalListenerIsRemovedOnTerminate() {
    const childCode = `
      const workerCode = \`
        Edno.addSignalListener("SIGTERM", () => {});
        self.postMessage("registered");
        setInterval(() => {}, 1000);
      \`;
      const worker = new Worker(
        "data:application/javascript," + encodeURIComponent(workerCode),
        { type: "module" },
      );
      await new Promise((resolve) => {
        worker.onmessage = resolve;
      });
      worker.terminate();
      await new Promise((resolve) => setTimeout(resolve, 250));
      console.log("ready");
      setInterval(() => {}, 1000);
    `;

    const child = new Edno.Command(Edno.execPath(), {
      args: ["eval", childCode],
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    const stdout = child.stdout
      .pipeThrough(new TextDecoderStream())
      .getReader();
    const stderrPromise = child.stderr
      .pipeThrough(new TextDecoderStream())
      .getReader()
      .read();

    try {
      const { value } = await stdout.read();
      assertEquals(value, "ready\n");

      child.kill("SIGTERM");
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const status = await Promise.race([
        child.status,
        new Promise<undefined>((resolve) => {
          timeoutId = setTimeout(() => resolve(undefined), 2000);
        }),
      ]);
      clearTimeout(timeoutId);

      if (status === undefined) {
        child.kill("SIGKILL");
        await child.status;
        const stderr = (await stderrPromise).value ?? "";
        throw new Error(`child ignored SIGTERM; stderr: ${stderr}`);
      }

      assertEquals(status.signal, "SIGTERM");
    } finally {
      stdout.releaseLock();
    }
  },
);

Edno.test(
  {
    ignore: Edno.build.os !== "windows",
    permissions: { run: true },
  },
  function windowsThrowsOnNegativeProcessIdTest() {
    assertThrows(
      () => {
        Edno.kill(-1, "SIGKILL");
      },
      TypeError,
      "Invalid pid",
    );
  },
);

Edno.test(
  {
    ignore: Edno.build.os !== "windows",
    permissions: { run: true },
  },
  function noOpenSystemIdleProcessTest() {
    let signal: Edno.Signal = "SIGKILL";

    assertThrows(
      () => {
        Edno.kill(0, signal);
      },
      TypeError,
      `Invalid pid`,
    );

    signal = "SIGTERM";
    assertThrows(
      () => {
        Edno.kill(0, signal);
      },
      TypeError,
      `Invalid pid`,
    );
  },
);

Edno.test(function signalInvalidHandlerTest() {
  assertThrows(() => {
    // edno-lint-ignore no-explicit-any
    Edno.addSignalListener("SIGINT", "handler" as any);
  });
  assertThrows(() => {
    // edno-lint-ignore no-explicit-any
    Edno.removeSignalListener("SIGINT", "handler" as any);
  });
});

Edno.test(
  {
    ignore: Edno.build.os === "windows",
    permissions: { run: true },
  },
  function signalForbiddenSignalTest() {
    assertThrows(
      () => Edno.addSignalListener("SIGKILL", () => {}),
      TypeError,
      "Binding to signal 'SIGKILL' is not allowed",
    );
    assertThrows(
      () => Edno.addSignalListener("SIGSTOP", () => {}),
      TypeError,
      "Binding to signal 'SIGSTOP' is not allowed",
    );
    assertThrows(
      () => Edno.addSignalListener("SIGILL", () => {}),
      TypeError,
      "Binding to signal 'SIGILL' is not allowed",
    );
    assertThrows(
      () => Edno.addSignalListener("SIGFPE", () => {}),
      TypeError,
      "Binding to signal 'SIGFPE' is not allowed",
    );
    assertThrows(
      () => Edno.addSignalListener("SIGSEGV", () => {}),
      TypeError,
      "Binding to signal 'SIGSEGV' is not allowed",
    );
  },
);

Edno.test(
  { ignore: Edno.build.os !== "linux" },
  function signalAliasLinux() {
    const i = () => {};
    Edno.addSignalListener("SIGUNUSED", i);
    Edno.addSignalListener("SIGPOLL", i);

    Edno.removeSignalListener("SIGUNUSED", i);
    Edno.removeSignalListener("SIGPOLL", i);
  },
);

Edno.test(
  {
    ignore: Edno.build.os === "windows",
    permissions: { run: true },
  },
  function killWithSignalZero() {
    // This should not throw for the current process
    Edno.kill(Edno.pid, 0);

    // Test with a non-existent PID (very high number unlikely to exist)
    assertThrows(
      () => {
        Edno.kill(999999, 0);
      },
      Edno.errors.NotFound,
    );
  },
);

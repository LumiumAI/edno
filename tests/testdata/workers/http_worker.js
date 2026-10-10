// Copyright 2018-2026 the Deno authors. MIT license.

// edno-lint-ignore-file no-deprecated-edno-api

const listener = Edno.listen({ hostname: "127.0.0.1", port: 4506 });
postMessage("ready");
for await (const conn of listener) {
  (async () => {
    // @ts-ignore `Edno.serveHttp()` was soft-removed in Edno 2.
    const requests = Edno.serveHttp(conn);
    for await (const { respondWith } of requests) {
      respondWith(new Response("Hello world"));
    }
  })();
}

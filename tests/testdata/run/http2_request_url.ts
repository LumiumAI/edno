const listener = Edno.listen({
  port: Number(Edno.args[0]),
});

console.log("READY");

for await (const conn of listener) {
  // @ts-ignore `Edno.serveHttp()` was soft-removed in Edno 2.
  for await (const { request, respondWith } of Edno.serveHttp(conn)) {
    const href = new URL(request.url).href;
    respondWith(new Response(href));
  }
}

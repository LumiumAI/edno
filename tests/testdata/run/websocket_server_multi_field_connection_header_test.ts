const { promise, resolve } = Promise.withResolvers<void>();
const listener = Edno.listen({ port: 4319 });
console.log("READY");
const conn = await listener.accept();
// @ts-ignore `Edno.serveHttp()` was soft-removed in Edno 2.
const httpConn = Edno.serveHttp(conn);
const { request, respondWith } = (await httpConn.nextRequest())!;
const {
  response,
  socket,
} = Edno.upgradeWebSocket(request);
socket.onerror = () => Edno.exit(1);
socket.onopen = () => socket.close();
socket.onclose = () => resolve();
await respondWith(response);
await promise;

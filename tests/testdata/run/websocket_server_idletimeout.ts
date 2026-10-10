import { assertEquals } from "@std/assert";

const errorDeferred = Promise.withResolvers<void>();
const closeDeferred = Promise.withResolvers<void>();

const listener = Edno.listen({ port: 4509 });
console.log("READY");
// @ts-ignore `Edno.serveHttp()` was soft-removed in Edno 2.
const httpConn = Edno.serveHttp(await listener.accept());
const { request, respondWith } = (await httpConn.nextRequest())!;
const { response, socket } = Edno.upgradeWebSocket(request, {
  idleTimeout: 1,
});
socket.onerror = (e) => {
  console.log(e);
  assertEquals((e as ErrorEvent).message, "No response from ping frame.");
  errorDeferred.resolve();
};
socket.onclose = (e) => {
  console.log(e);
  assertEquals(e.reason, "No response from ping frame.");
  closeDeferred.resolve();
};
await respondWith(response);

await errorDeferred.promise;
await closeDeferred.promise;

// TODO(mmastrac): this doesn't exit on its own. Why?
Edno.exit(123);

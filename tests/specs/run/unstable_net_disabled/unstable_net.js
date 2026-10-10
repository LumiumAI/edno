const scope = import.meta.url.slice(-7) === "#worker" ? "worker" : "main";

console.log(scope, Edno.listenDatagram);
console.log(scope, globalThis.WebSocketStream);

if (scope === "worker") {
  postMessage("done");
} else {
  const worker = new Worker(`${import.meta.url}#worker`, { type: "module" });
  worker.onmessage = () => Edno.exit(0);
}

const scope = import.meta.url.slice(-7) === "#worker" ? "worker" : "main";

console.log(scope, Edno.AtomicOperation);
console.log(scope, Edno.Kv);
console.log(scope, Edno.KvListIterator);
console.log(scope, Edno.KvU64);
console.log(scope, Edno.openKv);

if (scope === "worker") {
  postMessage("done");
} else {
  const worker = new Worker(`${import.meta.url}#worker`, { type: "module" });
  worker.onmessage = () => Edno.exit(0);
}

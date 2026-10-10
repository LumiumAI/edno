// Probe Edno.openKv() under EDNO_KV_REQUIRES_DISTRIBUTED_DATABASE.
console.log("typeof openKv:", typeof Edno.openKv);
try {
  const kv = await Edno.openKv();
  console.log("opened ok");
  kv.close();
} catch (e) {
  console.log("caught:", (e as Error).message);
}

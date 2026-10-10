import { assertRejects } from "@std/assert";

const listener = Edno.listenTls({
  port: Number(Edno.args[0]),
  cert: Edno.readTextFileSync("./tls/localhost.crt"),
  key: Edno.readTextFileSync("./tls/localhost.key"),
  alpnProtocols: ["h2", "http/1.1", "foobar"],
});

console.log("READY");

const conn = await listener.accept() as Edno.TlsConn;
await assertRejects(
  () => conn.handshake(),
  Edno.errors.InvalidData,
  "peer doesn't support any known protocol",
);
conn.close();

listener.close();

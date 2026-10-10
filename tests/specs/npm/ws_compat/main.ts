import WebSocket from "npm:ws@8.18.0";

const key = Edno.readTextFileSync("../../../testdata/tls/localhost.key");
const cert = Edno.readTextFileSync("../../../testdata/tls/localhost.crt");

Edno.serve({ key, cert, port: 0, onListen }, (req) => {
  const { socket, response } = Edno.upgradeWebSocket(req);
  socket.addEventListener("open", () => {
    console.log("open on server");
  });
  socket.addEventListener("message", () => {
    console.log("message on server");
    Edno.exit(0);
  });
  return response;
});

function onListen({ port }) {
  const socket = new WebSocket(`wss://localhost:${port}`);
  socket.on("open", () => {
    console.log("open on client");
    socket.send("hi");
  });
}

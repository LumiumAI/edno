/// <reference no-default-lib="true" />
/// <reference lib="edno.ns" />

// unstable apis removed here, so should error
Edno.listenDatagram({
  port: 3000,
  transport: "udp",
});

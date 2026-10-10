Edno.serve({
  onListen() {
    Edno.writeTextFileSync(Edno.args[0], "started");
  },
  port: 8001,
}, (req) => {
  console.log("server 2");
  setTimeout(() => Edno.exit(0), 1000);
  return new Response("Hello World!");
});

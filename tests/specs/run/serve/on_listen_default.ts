const server = Edno.serve({
  handler() {
    return new Response("Hello World");
  },
  hostname: "0.0.0.0",
  port: 0,
});

await server.shutdown();

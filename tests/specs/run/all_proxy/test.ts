await using server = Edno.serve({
  transport: "vsock",
  cid: -1,
  port: 1234567,
}, (req) => {
  return new Response(req.url);
});

await new Edno.Command(Edno.execPath(), {
  args: ["run", "-A", "client.ts"],
  env: {
    "ALL_PROXY": "vsock:1:1234567",
  },
  stderr: "inherit",
  stdout: "inherit",
}).output();

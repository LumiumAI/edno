export default {
  fetch() {
    return new Response("Hello, world!");
  },
  onListen() {
    console.log("Listening");
    Edno.exit(0);
  },
} satisfies Edno.ServeDefaultExport;

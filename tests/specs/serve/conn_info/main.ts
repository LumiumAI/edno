(async () => {
  for (let i = 0; i < 1000; i++) {
    try {
      const resp = await fetch("http://localhost:12468/");
      Edno.exit(0);
    } catch {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  Edno.exit(2);
})();

export default {
  fetch(request, connInfo) {
    console.log(connInfo);
    return new Response("Hello world!");
  },
} satisfies Edno.ServeDefaultExport;

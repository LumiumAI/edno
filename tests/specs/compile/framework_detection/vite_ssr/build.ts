await Edno.mkdir("dist", { recursive: true });
await Edno.writeTextFile("dist/index.html", "<h1>built</h1>");

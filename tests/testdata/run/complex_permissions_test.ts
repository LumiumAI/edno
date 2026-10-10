// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
const name = Edno.args[0];
// edno-lint-ignore no-explicit-any
const test: { [key: string]: (...args: any[]) => void | Promise<void> } = {
  read(files: string[]) {
    files.forEach((file) => Edno.readFileSync(file));
  },
  write(files: string[]) {
    files.forEach((file) =>
      Edno.writeFileSync(file, new Uint8Array(0), { append: true })
    );
  },
  netFetch(urls: string[]) {
    urls.forEach((url) => fetch(url));
  },
  netListen(endpoints: string[]) {
    endpoints.forEach((endpoint) => {
      const index = endpoint.lastIndexOf(":");
      const [hostname, port] = [
        endpoint.substr(0, index),
        endpoint.substr(index + 1),
      ];
      const listener = Edno.listen({
        transport: "tcp",
        hostname,
        port: parseInt(port, 10),
      });
      listener.close();
    });
  },
  async netConnect(endpoints: string[]) {
    for (const endpoint of endpoints) {
      const index = endpoint.lastIndexOf(":");
      const [hostname, port] = [
        endpoint.substr(0, index),
        endpoint.substr(index + 1),
      ];
      const listener = await Edno.connect({
        transport: "tcp",
        hostname,
        port: parseInt(port, 10),
      });
      listener.close();
    }
  },
};

if (!test[name]) {
  console.log("Unknown test:", name);
  Edno.exit(1);
}

test[name](Edno.args.slice(1));

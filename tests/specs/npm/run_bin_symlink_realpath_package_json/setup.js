Edno.mkdirSync("node_modules/.bin", { recursive: true });
Edno.mkdirSync("node_modules/pkg/bin", { recursive: true });
Edno.mkdirSync("node_modules/pkg/lib", { recursive: true });

Edno.writeTextFileSync("package.json", "{}\n");
Edno.writeTextFileSync(
  "node_modules/pkg/package.json",
  '{"name":"pkg","version":"1.0.0","type":"module"}\n',
);
Edno.writeTextFileSync(
  "node_modules/pkg/bin/cli.js",
  "import { x } from '../lib/x.js';\nconsole.log('loaded ok:', x);\n",
);
Edno.writeTextFileSync(
  "node_modules/pkg/lib/x.js",
  "export const x = 'OK';\n",
);
Edno.symlinkSync("../pkg/bin/cli.js", "node_modules/.bin/cli");

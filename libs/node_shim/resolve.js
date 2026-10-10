// Copyright 2018-2026 the Deno authors. MIT license.

import { createRequire } from "node:module";
const require = createRequire(Edno.args[0]);
// edno-lint-ignore no-console
console.log(require.resolve(Edno.args[1]));

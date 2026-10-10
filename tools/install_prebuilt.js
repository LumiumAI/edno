#!/usr/bin/env -S edno run --allow-write --allow-read --allow-net --allow-env --config=tests/config/edno.json
// Copyright 2018-2026 the Deno authors. MIT license.
import { getPrebuilt } from "./util.js";

const args = Edno.args.slice();
for (const arg of args) {
  await getPrebuilt(arg);
}

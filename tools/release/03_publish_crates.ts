#!/usr/bin/env -S edno run -A --lock=tools/edno.lock.json
// Copyright 2018-2026 the Deno authors. MIT license.

// edno-lint-ignore-file no-console

import { EdnoWorkspace } from "./edno_workspace.ts";
import { $, getCratesPublishOrder } from "./deps.ts";

$.logStep(`Running cargo publish...`);

const workspace = await EdnoWorkspace.load();
const cliCrate = workspace.getCliCrate();

const dependencyCrates = getCratesPublishOrder(
  workspace.getCliDependencyCrates(),
);

try {
  for (const [i, crate] of dependencyCrates.entries()) {
    // `--no-verify` because the dependency crates can't be built on their own:
    // they depend on `edno_core` with default features off, so nothing selects
    // an engine for the `edno_v8` facade and it hits its `compile_error!`.
    // Engine selection happens at the top of the tree (see `edno`'s `v8` and
    // `quickjs` features), which cargo's standalone tarball verification can't
    // reproduce. The `edno` crate itself is still verified below.
    await crate.publish("--no-verify");
    $.log(`Finished ${i + 1} of ${dependencyCrates.length} crates.`);
  }

  await cliCrate.publish();
} finally {
  // system beep to notify error or completion
  console.log("\x07");
}

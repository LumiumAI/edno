#!/usr/bin/env -S edno run --allow-all --config=tests/config/edno.json
// Copyright 2018-2026 the Deno authors. MIT license.
import { join, ROOT_PATH } from "./util.js";

const subcommand = Edno.args.includes("--check") ? "check" : "fmt";
const configFile = join(ROOT_PATH, ".dprint.json");
const cmd = new Edno.Command("edno", {
  args: [
    "run",
    "-A",
    "--no-config",
    "npm:dprint@0.47.2",
    subcommand,
    "--config=" + configFile,
  ],
  cwd: ROOT_PATH,
  stdout: "inherit",
  stderr: "inherit",
});

const { code } = await cmd.output();
Edno.exit(code);

#!/usr/bin/env -S edno run -A --lock=tools/edno.lock.json
// Copyright 2018-2026 the Deno authors. MIT license.
import { $ } from "./deps.ts";
import { EdnoWorkspace } from "./edno_workspace.ts";

const workspace = await EdnoWorkspace.load();

// create a release notes file for the GH release draft
$.path(EdnoWorkspace.rootDirPath)
  .join("./target/release/release-notes.md")
  .writeTextSync(workspace.getReleasesMdFile().getLatestReleaseText().fullText);

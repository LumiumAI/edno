// Copyright 2018-2026 the Deno authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:edno_node/wasi.ts");

export const { WASI } = mod;

export default mod.default;

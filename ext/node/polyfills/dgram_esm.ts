// Copyright 2018-2026 the Deno authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:edno_node/dgram.ts");

export const { createSocket, Socket } = mod;

export default mod.default;

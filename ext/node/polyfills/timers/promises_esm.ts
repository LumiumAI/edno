// Copyright 2018-2026 the Deno authors. MIT license.
import { core } from "ext:core/mod.js";
const mod = core.loadExtScript("ext:edno_node/timers/promises.ts");

export const { setTimeout, setImmediate, setInterval, scheduler } = mod;

export default mod;

// Copyright 2018-2026 the Deno authors. MIT license.

import { loadTestLibrary } from "../../../tests/napi/common.js";

const lib = loadTestLibrary();

Edno.bench("warmup", () => {});
Edno.bench("napi_get_undefined", () => lib.test_get_undefined(0));

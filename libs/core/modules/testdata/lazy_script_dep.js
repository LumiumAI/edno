// Copyright 2018-2026 the Deno authors. MIT license.
(function () {
const utils = Edno.core.loadExtScript("ext:test_ext/lazy_script.js");
return { fromDep: true, utils };
})();

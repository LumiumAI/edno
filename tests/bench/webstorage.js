// Copyright 2018-2026 the Deno authors. MIT license.

// edno-lint-ignore-file no-console

// Note: when benchmarking across different Edno version, make sure to clear
// the EDNO_DIR cache.
let [total, count] = typeof Edno !== "undefined" ? Edno.args : [];

total = total ? parseInt(total, 0) : 50;
count = count ? parseInt(count, 10) : 1000000;

function bench(fun) {
  const start = Date.now();
  for (let i = 0; i < count; i++) fun(i);
  const elapsed = Date.now() - start;
  const rate = Math.floor(count / (elapsed / 1000));
  console.log(`time ${elapsed} ms rate ${rate}`);
  if (--total) queueMicrotask(() => bench(fun));
}

localStorage.clear();
localStorage.setItem("foo", "bar");
bench(() => localStorage.getItem("foo"));

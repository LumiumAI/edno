// Regression test for https://github.com/denoland/deno/issues/22592
// edno-lint-ignore require-await
async function rejects() {
  return Promise.reject();
}
await rejects();

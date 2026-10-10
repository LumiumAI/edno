// Stand in for `vite build`: emit a minimal static site into `dist/`, including
// a hashed asset so the compiled binary bundles the whole directory.
await Edno.mkdir("dist/assets", { recursive: true });
await Edno.writeTextFile(
  "dist/index.html",
  '<!doctype html><html><head><script type="module" src="/assets/index-abc.js">' +
    '</script></head><body><div id="app"></div></body></html>',
);
await Edno.writeTextFile(
  "dist/assets/index-abc.js",
  'document.querySelector("#app").textContent = "built";',
);

const info = await import("npm:@ednotest/binary-package@1/package.json", {
  assert: { type: "json" },
});
console.log(json);

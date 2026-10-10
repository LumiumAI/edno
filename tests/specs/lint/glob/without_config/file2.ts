try {
  await Edno.open("./some/file.txt");
} catch (_e) {}

// edno-lint-ignore no-explicit-any
function _foo(): any {}

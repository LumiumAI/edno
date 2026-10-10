const arch = Edno.args[0];
const notArch = Edno.args[1];
const pkg = `@ednotest+multiple-arches-win32-${arch}@1.0.0`;
try {
  Edno.statSync(`node_modules/.edno/${pkg}`);
  console.log(`${arch}: FOUND`);
} catch {
  console.log(`${arch}: NOT FOUND`);
}
if (notArch) {
  const notPkg = `@ednotest+multiple-arches-win32-${notArch}@1.0.0`;
  try {
    Edno.statSync(`node_modules/.edno/${notPkg}`);
    console.log(`${notArch}: FOUND (unexpected)`);
  } catch {
    console.log(`${notArch}: NOT FOUND (expected)`);
  }
}

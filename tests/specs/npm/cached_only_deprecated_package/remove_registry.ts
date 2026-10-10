// Remove the cached packument (registry.json) for the deprecated package so
// that its registry info is no longer available from the cache. node_modules
// and the tarball remain in place, simulating running `--cached-only` when the
// registry metadata for a deprecated package was never cached.
const path = Edno.args[0] +
  "/npm/localhost_4260/@ednotest/deprecated-package-with-bin/registry.json";
Edno.removeSync(path);

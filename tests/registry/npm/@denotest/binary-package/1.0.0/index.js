const packageByOs = {
  "darwin": "@ednotest/binary-package-mac",
  "linux": "@ednotest/binary-package-linux",
  "win32": "@ednotest/binary-package-windows",
}

const selectedPackage = packageByOs[process.platform];

if (!selectedPackage) {
  throw new Error("trying to run on unsupported platform");
}

require(selectedPackage);
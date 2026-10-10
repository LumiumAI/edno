import { url } from "npm:@ednotest/esm-basic";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

// will be at node_modules\.edno\@ednotest+esm-basic@1.0.0\node_modules\@ednotest\esm-basic
const dirPath = path.dirname(fileURLToPath(url));
const nodeModulesPath = path.join(dirPath, "../../../../../");
const packageJsonText = `{
  "name": "@ednotest/esm-basic",
  "version": "1.0.0",
  "type": "module",
  "main": "main.mjs",
  "types": "main.d.mts"
}
`;
const vfsPackageJsonPath = path.join(dirPath, "package.json");

// reading a file in vfs
{
  const text = Edno.readTextFileSync(vfsPackageJsonPath);
  assert.equal(text, packageJsonText);
}

// reading a file async in vfs
{
  const text = await Edno.readTextFile(vfsPackageJsonPath);
  assert.equal(text, packageJsonText);
}

// copy file from vfs to real fs
{
  Edno.copyFileSync(vfsPackageJsonPath, "package.json");
  assert.equal(Edno.readTextFileSync("package.json"), packageJsonText);
}

// copy to vfs
assert.throws(
  () => Edno.copyFileSync("package.json", vfsPackageJsonPath),
  Edno.errors.NotSupported,
);
Edno.removeSync("package.json");

// copy file async from vfs to real fs
{
  await Edno.copyFile(vfsPackageJsonPath, "package.json");
  assert.equal(Edno.readTextFileSync("package.json"), packageJsonText);
}

// copy to vfs async
await assert.rejects(
  () => Edno.copyFile("package.json", vfsPackageJsonPath),
  Edno.errors.NotSupported,
);
Edno.removeSync("package.json");

// open
{
  const file = Edno.openSync(vfsPackageJsonPath);
  const bytes = new Uint8Array(10);
  file.seekSync(2, Edno.SeekMode.Start);
  assert.equal(file.readSync(bytes), 10);
  const text = new TextDecoder().decode(bytes);
  assert.equal(text, packageJsonText.slice(2, 12));
}
{
  const file = await Edno.open(vfsPackageJsonPath);
  const bytes = new Uint8Array(10);
  await file.seek(2, Edno.SeekMode.Start);
  assert.equal(await file.read(bytes), 10);
  const text = new TextDecoder().decode(bytes);
  assert.equal(text, packageJsonText.slice(2, 12));
}

// chdir
// Changing into a directory inside the VFS is a no-op rather than an error,
// so that programs that chdir into their own directory (e.g. Next.js
// standalone builds) keep working when compiled.
Edno.chdir(dirPath);
// chdir into a file in the VFS still fails
assert.throws(
  () => Edno.chdir(vfsPackageJsonPath),
  Edno.errors.NotADirectory,
);
// chdir into a non-existent VFS path still fails
assert.throws(
  () => Edno.chdir(path.join(dirPath, "nonexistent")),
  Edno.errors.NotFound,
);

// mkdir
assert.throws(
  () => Edno.mkdirSync(path.join(dirPath, "subDir")),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.mkdir(path.join(dirPath, "subDir")),
  Edno.errors.NotSupported,
);

// chmod
assert.throws(
  () => Edno.chmodSync(vfsPackageJsonPath, 0o777),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.chmod(vfsPackageJsonPath, 0o777),
  Edno.errors.NotSupported,
);

// chown
assert.throws(
  () => Edno.chownSync(vfsPackageJsonPath, 1000, 1000),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.chown(vfsPackageJsonPath, 1000, 1000),
  Edno.errors.NotSupported,
);

// remove
assert.throws(
  () => Edno.removeSync(vfsPackageJsonPath),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.remove(vfsPackageJsonPath),
  Edno.errors.NotSupported,
);

// stat
{
  const result = Edno.statSync(vfsPackageJsonPath);
  assert(result.isFile);
}
{
  const result = await Edno.stat(vfsPackageJsonPath);
  assert(result.isFile);
}

// lstat
{
  const result = Edno.lstatSync(
    path.join(nodeModulesPath, "@ednotest", "esm-basic"),
  );
  assert(result.isSymlink);
}
{
  const result = await Edno.lstat(
    path.join(nodeModulesPath, "@ednotest", "esm-basic"),
  );
  assert(result.isSymlink);
}

// realpath
{
  const result = Edno.realPathSync(
    path.join(nodeModulesPath, "@ednotest", "esm-basic", "package.json"),
  );
  assert.equal(result, vfsPackageJsonPath);
}
{
  const result = await Edno.realPath(
    path.join(nodeModulesPath, "@ednotest", "esm-basic", "package.json"),
  );
  assert.equal(result, vfsPackageJsonPath);
}

// read dir
const readDirNames = ["main.d.mts", "main.mjs", "other.mjs", "package.json"];
{
  const names = Array.from(Edno.readDirSync(dirPath))
    .map((e) => e.name);
  assert.deepEqual(readDirNames, names);
}
{
  const names = [];
  for await (const entry of Edno.readDir(dirPath)) {
    names.push(entry.name);
  }
  assert.deepEqual(readDirNames, names);
}

// rename
assert.throws(
  () => Edno.renameSync("package.json", vfsPackageJsonPath),
  Edno.errors.NotSupported,
);
assert.throws(
  () => Edno.renameSync(vfsPackageJsonPath, "package.json"),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.rename("package.json", vfsPackageJsonPath),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.rename(vfsPackageJsonPath, "package.json"),
  Edno.errors.NotSupported,
);

// link
assert.throws(
  () => Edno.linkSync("package.json", vfsPackageJsonPath),
  Edno.errors.NotSupported,
);
assert.throws(
  () => Edno.linkSync(vfsPackageJsonPath, "package.json"),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.link("package.json", vfsPackageJsonPath),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.link(vfsPackageJsonPath, "package.json"),
  Edno.errors.NotSupported,
);

// symlink
assert.throws(
  () => Edno.symlinkSync("package.json", vfsPackageJsonPath),
  Edno.errors.NotSupported,
);
assert.throws(
  () => Edno.symlinkSync(vfsPackageJsonPath, "package.json"),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.symlink("package.json", vfsPackageJsonPath),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.symlink(vfsPackageJsonPath, "package.json"),
  Edno.errors.NotSupported,
);

// read link
{
  const result = Edno.readLinkSync(
    path.join(nodeModulesPath, "@ednotest", "esm-basic"),
  );
  assert.equal(result, dirPath);
}
{
  const result = await Edno.readLink(
    path.join(nodeModulesPath, "@ednotest", "esm-basic"),
  );
  assert.equal(result, dirPath);
}

// truncate
assert.throws(
  () => Edno.truncateSync(vfsPackageJsonPath, 0),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.truncate(vfsPackageJsonPath, 0),
  Edno.errors.NotSupported,
);

// utime
assert.throws(
  () => Edno.utimeSync(vfsPackageJsonPath, 0, 0),
  Edno.errors.NotSupported,
);
await assert.rejects(
  () => Edno.utime(vfsPackageJsonPath, 0, 0),
  Edno.errors.NotSupported,
);

console.log("success");

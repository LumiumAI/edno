# Edno runtime tests

Files in this directory are unit tests for Edno runtime.

Testing Edno runtime code requires checking API under different runtime
permissions. To accomplish this all tests exercised are created using
`Edno.test()` function.

```ts
import {} from "./test_util.ts";

Edno.test(function simpleTestFn(): void {
  // test code here
});

Edno.test(
  {
    ignore: Edno.build.os === "windows",
    permissions: { read: true, write: true },
  },
  function complexTestFn(): void {
    // test code here
  },
);
```

## Running tests

There are two ways to run `unit_test_runner.ts`:

```sh
# Run all tests.
cargo run --bin edno -- test --allow-all --location=http://js-unit-tests/foo/bar cli/tests/unit/

# Run a specific test module
cargo run --bin edno -- test --allow-all --location=http://js-unit-tests/foo/bar cli/tests/unit/files_test.ts
```

### Http server

`target/debug/test_server` is required to run when one's running unit tests.
During CI it's spawned automatically, but if you want to run tests manually make
sure that server is spawned otherwise there'll be cascade of test failures.

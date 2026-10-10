import type { Fizzbuzz } from "npm:@ednotest/types";
import type { SomeInterface } from "npm:@ednotest/types_imported";
import type { Foobar as FooInterface } from "npm:@ednotest/types_imported/subpath";
import { getClient } from "npm:@ednotest/types-exports-subpaths/client";
import { entryImport } from "npm:@ednotest/types-exports-subpaths/entry-import";
import { entryA } from "npm:@ednotest/types-exports-subpaths/entry-a";
import { entryTypes } from "npm:@ednotest/types-exports-subpaths/entry-types-last-no-declaration-before";

const foobar: FooInterface = {
  foo: "foo",
  bar: 1,
};

const i: SomeInterface = {
  prop: 1,
  prop2: "asdf",
};

const fizzbuzz: Fizzbuzz = {
  fizz: 1,
  buzz: 2,
};

const valueA: "test1" = getClient();
const valueB: "test2" = entryImport();
const valueC: "test3" = entryA();
const valueD: "test4" = entryTypes();

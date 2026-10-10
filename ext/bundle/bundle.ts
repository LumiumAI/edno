// Copyright 2018-2026 the Deno authors. MIT license.
/// <reference path="../../cli/tsc/dts/lib.edno.unstable.d.ts" />
import { op_bundle } from "ext:core/ops";
import { core, primordials } from "ext:core/mod.js";
const { TextDecoder } = core.loadExtScript("ext:edno_web/08_text_encoding.js");

const { SafeArrayIterator, Uint8Array, ObjectPrototypeIsPrototypeOf } =
  primordials;

const decoder = new TextDecoder();

export async function bundle(
  options: Edno.bundle.Options,
): Promise<Edno.bundle.Result> {
  const result = {
    success: false,
    ...await op_bundle(
      options,
    ),
  };
  result.success = result.errors.length === 0;

  for (
    const f of new SafeArrayIterator(
      // edno-lint-ignore no-explicit-any
      result.outputFiles as any ?? [],
    )
  ) {
    // edno-lint-ignore no-explicit-any
    const file = f as any;
    if (file.contents?.length === 0) {
      delete file.contents;
      file.text = () => "";
    } else {
      if (!ObjectPrototypeIsPrototypeOf(Uint8Array, file.contents)) {
        file.contents = new Uint8Array(file.contents);
      }
      file.text = () => decoder.decode(file.contents ?? "");
    }
  }
  if (result.outputFiles?.length === 0) {
    delete result.outputFiles;
  }
  return result;
}

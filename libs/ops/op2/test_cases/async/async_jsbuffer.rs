// Copyright 2018-2026 the Deno authors. MIT license.

#![deny(warnings)]
edno_ops_compile_test_runner::prelude!();

use edno_core::JsBuffer;

#[op2]
#[buffer]
pub async fn op_async_v8_buffer(#[buffer] buf: JsBuffer) -> JsBuffer {
  buf
}

// Copyright 2018-2026 the Deno authors. MIT license.

#![deny(warnings)]
edno_ops_compile_test_runner::prelude!();

#[op2]
#[string]
pub fn op_string_return(#[string] s: Option<String>) -> Option<String> {
  s
}

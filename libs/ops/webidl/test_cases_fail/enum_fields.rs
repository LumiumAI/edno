// Copyright 2018-2026 the Deno authors. MIT license.

#![deny(warnings)]
edno_ops_compile_test_runner::prelude!();

#[derive(WebIDL)]
#[webidl(enum)]
pub enum Enumeration {
  FooBar(u32),
  Baz,
}

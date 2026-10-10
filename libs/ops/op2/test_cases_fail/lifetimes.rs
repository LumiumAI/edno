// Copyright 2018-2026 the Deno authors. MIT license.
#![deny(warnings)]
edno_ops_compile_test_runner::prelude!();
use edno_core::GarbageCollected;
use edno_core::v8;

struct Wrap;

unsafe impl GarbageCollected for Wrap {
  fn trace(&self, _visitor: &mut v8::cppgc::Visitor) {}

  fn get_name(&self) -> &'static std::ffi::CStr {
    c"Wrap"
  }
}

#[op2(fast)]
fn op_use_cppgc_object(#[cppgc] _wrap: &'static Wrap) {}

#[op2(fast)]
fn op_use_buffer(#[buffer] _buffer: &'static [u8]) {}

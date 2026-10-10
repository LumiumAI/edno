// Copyright 2018-2026 the Deno authors. MIT license.
//!  This example shows you how to define ops in Rust and then call them from
//!  JavaScript.

use edno_core::Extension;
use edno_core::JsRuntime;
use edno_core::RuntimeOptions;

fn main() {
  let my_ext = Extension {
    name: "my_ext",
    middleware_fn: Some(Box::new(|op| match op.name {
      "op_print" => op.disable(),
      _ => op,
    })),
    ..Default::default()
  };

  // Initialize a runtime instance
  let mut runtime = JsRuntime::new(RuntimeOptions {
    extensions: vec![my_ext],
    ..Default::default()
  });

  // Edno.core.print() will now be a NOP
  runtime
    .execute_script("<usage>", r#"Edno.core.print("I'm broken")"#)
    .unwrap();
}

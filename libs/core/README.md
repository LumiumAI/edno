# Edno Core Crate

[![crates](https://img.shields.io/crates/v/edno_core.svg)](https://crates.io/crates/edno_core)
[![docs](https://docs.rs/edno_core/badge.svg)](https://docs.rs/edno_core)

The main dependency of this crate is
[rusty_v8](https://github.com/denoland/rusty_v8), which provides the V8-Rust
bindings.

This Rust crate contains the essential V8 bindings for Edno's command-line
interface (Edno CLI). The main abstraction here is the JsRuntime which provides
a way to execute JavaScript.

The JsRuntime implements an event loop abstraction for the executed code that
keeps track of all pending tasks (async ops, dynamic module loads). It is user's
responsibility to drive that loop by using `JsRuntime::run_event_loop` method -
it must be executed in the context of Rust's future executor (eg. tokio, smol).

Rust functions can be registered in JavaScript using the `edno_core::extension!`
macro. A conventional way to write ops is using the
[`edno_ops`](../ops/README.md) crate.

Documentation for this crate is thin at the moment. Please see
[hello_world.rs](./examples/hello_world.rs) and
[eval_js_value.rs](./examples/eval_js_value.rs) as examples of usage.

TypeScript support and lots of other functionality are not available at this
layer. See the [CLI](https://github.com/denoland/deno/tree/main/cli) for that.

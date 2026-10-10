// Copyright 2018-2026 the Deno authors. MIT license.

use edno_core::OpState;
use edno_core::op2;
use edno_core::v8;

mod bitmaprenderer;
pub mod byow;
mod canvas;

edno_core::extension!(
  edno_canvas,
  deps = [edno_webidl, edno_web, edno_webgpu],
  ops = [op_init_canvas],
  objects = [
    bitmaprenderer::ImageBitmapRenderingContext,
    canvas::OffscreenCanvas,
    byow::UnsafeWindowSurface,
  ],
  lazy_loaded_esm = ["01_canvas.js"],
  lazy_loaded_js = ["02_surface.js"],
);

#[op2(fast)]
pub fn op_init_canvas(
  state: &mut OpState,
  scope: &mut v8::PinScope<'_, '_>,
  blob: v8::Local<v8::Value>,
) {
  state.put(canvas::BlobHandle(v8::Global::new(scope, blob.cast())));
}

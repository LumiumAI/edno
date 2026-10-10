// Copyright 2018-2026 the Deno authors. MIT license.

use edno_bench_util::BenchOptions;
use edno_bench_util::bench_js_sync_with;
use edno_bench_util::bench_or_profile;
use edno_bench_util::bencher::Bencher;
use edno_bench_util::bencher::benchmark_group;
use edno_core::Extension;

fn setup() -> Vec<Extension> {
  edno_core::extension!(
    bench_setup,
    js = ["ext:bench_setup/setup.js" = {
      source = r#"
        const hello = "hello world\n";
        const hello1k = hello.repeat(1e3);
        const hello1m = hello.repeat(1e6);
        const helloEncoded = Edno.core.encode(hello);
        const hello1kEncoded = Edno.core.encode(hello1k);
        const hello1mEncoded = Edno.core.encode(hello1m);
      "#
    }]
  );

  vec![bench_setup::init()]
}

fn bench_utf8_encode_12_b(b: &mut Bencher) {
  bench_js_sync_with(
    b,
    r#"Edno.core.encode(hello);"#,
    setup,
    BenchOptions {
      benching_inner: 1,
      ..Default::default()
    },
  );
}

fn bench_utf8_encode_12_kb(b: &mut Bencher) {
  bench_js_sync_with(
    b,
    r#"Edno.core.encode(hello1k);"#,
    setup,
    BenchOptions {
      benching_inner: 1,
      ..Default::default()
    },
  );
}

fn bench_utf8_encode_12_mb(b: &mut Bencher) {
  bench_js_sync_with(
    b,
    r#"Edno.core.encode(hello1m);"#,
    setup,
    BenchOptions {
      benching_inner: 1,
      profiling_inner: 10,
      profiling_outer: 10,
    },
  );
}

fn bench_utf8_decode_12_b(b: &mut Bencher) {
  bench_js_sync_with(
    b,
    r#"Edno.core.decode(helloEncoded);"#,
    setup,
    BenchOptions {
      benching_inner: 1,
      ..Default::default()
    },
  );
}

fn bench_utf8_decode_12_kb(b: &mut Bencher) {
  bench_js_sync_with(
    b,
    r#"Edno.core.decode(hello1kEncoded);"#,
    setup,
    BenchOptions {
      benching_inner: 1,
      ..Default::default()
    },
  );
}

fn bench_utf8_decode_12_mb(b: &mut Bencher) {
  bench_js_sync_with(
    b,
    r#"Edno.core.decode(hello1mEncoded);"#,
    setup,
    BenchOptions {
      benching_inner: 1,
      profiling_inner: 10,
      profiling_outer: 10,
    },
  );
}

benchmark_group!(
  benches,
  bench_utf8_encode_12_b,
  bench_utf8_encode_12_kb,
  bench_utf8_encode_12_mb,
  bench_utf8_decode_12_b,
  bench_utf8_decode_12_kb,
  bench_utf8_decode_12_mb,
);
bench_or_profile!(benches);

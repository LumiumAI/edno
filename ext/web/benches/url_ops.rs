// Copyright 2018-2026 the Deno authors. MIT license.

use edno_bench_util::bench_js_sync;
use edno_bench_util::bench_or_profile;
use edno_bench_util::bencher::Bencher;
use edno_bench_util::bencher::benchmark_group;
use edno_core::Extension;

fn setup() -> Vec<Extension> {
  edno_core::extension!(
    bench_setup,
    esm_entry_point = "ext:bench_setup/setup",
    esm = ["ext:bench_setup/setup" = {
      source = r#"
        import { URL } from "ext:edno_web/00_url.js";
        globalThis.URL = URL;
      "#
    }]
  );

  vec![
    edno_webidl::edno_webidl::init(),
    edno_web::edno_web::init(
      std::sync::Arc::new(edno_web::BlobStore::default())
        as std::sync::Arc<dyn edno_web::BlobStoreTrait>,
      None,
      Default::default(),
      Default::default(),
    ),
    bench_setup::init(),
  ]
}

fn bench_url_parse(b: &mut Bencher) {
  bench_js_sync(b, r#"new URL(`http://www.google.com/`);"#, setup);
}

benchmark_group!(benches, bench_url_parse,);
bench_or_profile!(benches);

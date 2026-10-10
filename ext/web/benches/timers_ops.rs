// Copyright 2018-2026 the Deno authors. MIT license.

use edno_bench_util::bench_js_async;
use edno_bench_util::bench_or_profile;
use edno_bench_util::bencher::Bencher;
use edno_bench_util::bencher::benchmark_group;
use edno_core::Extension;

#[derive(Clone)]
struct Permissions;

fn setup() -> Vec<Extension> {
  edno_core::extension!(
    bench_setup,
    esm_entry_point = "ext:bench_setup/setup",
    esm = ["ext:bench_setup/setup" = {
      source = r#"
        import { setTimeout } from "ext:edno_web/02_timers.js";
        globalThis.setTimeout = setTimeout;
      "#
    }],
    state = |state| {
      state.put(Permissions {});
    },
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

fn bench_set_timeout(b: &mut Bencher) {
  bench_js_async(b, r#"setTimeout(() => {}, 0);"#, setup);
}

benchmark_group!(benches, bench_set_timeout,);
bench_or_profile!(benches);

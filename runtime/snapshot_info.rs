// Copyright 2018-2026 the Deno authors. MIT license.

use std::sync::Arc;

use edno_core::Extension;
use edno_resolver::npm::EdnoInNpmPackageChecker;
use edno_resolver::npm::NpmResolver;

use crate::ops;
use crate::shared::runtime;

pub fn get_extensions_in_snapshot() -> Vec<Extension> {
  // NOTE(bartlomieju): ordering is important here, keep it in sync with
  // `runtime/worker.rs`, `runtime/web_worker.rs`, `runtime/snapshot_info.rs`
  // and `runtime/snapshot.rs`!
  let fs = std::sync::Arc::new(edno_fs::RealFs);
  vec![
    edno_telemetry::edno_telemetry::init(),
    edno_webidl::edno_webidl::init(),
    edno_web::edno_web::init(
      edno_web::BlobStore::default_arc(),
      Default::default(),
      Default::default(),
      edno_web::InMemoryBroadcastChannel::default(),
    ),
    edno_webgpu::edno_webgpu::init(),
    edno_image::edno_image::init(),
    edno_canvas::edno_canvas::init(),
    edno_fetch::edno_fetch::init(Default::default()),
    edno_cache::edno_cache::init(None),
    edno_websocket::edno_websocket::init(),
    edno_webstorage::edno_webstorage::init(None),
    edno_crypto::edno_crypto::init(None),
    edno_ffi::edno_ffi::init(None),
    edno_net::edno_net::init(None, None),
    edno_tls::edno_tls::init(),
    edno_kv::edno_kv::init(
      Box::new(edno_kv::sqlite::SqliteDbHandler::new(None, None)),
      edno_kv::KvConfig::builder().build(),
    ),
    edno_cron::edno_cron::init(Box::new(
      edno_cron::local::LocalCronHandler::new(),
    )),
    edno_napi::edno_napi::init(None),
    edno_http::edno_http::init(edno_http::Options::default()),
    edno_io::edno_io::init(Some(Default::default())),
    edno_fs::edno_fs::init(fs.clone()),
    edno_os::edno_os::init(Default::default()),
    edno_process::edno_process::init(Default::default()),
    edno_node_crypto::edno_node_crypto::init(),
    edno_node_sqlite::edno_node_sqlite::init(),
    edno_node::edno_node::init::<
      EdnoInNpmPackageChecker,
      NpmResolver<sys_traits::impls::RealSys>,
      sys_traits::impls::RealSys,
    >(None, fs.clone()),
    ops::runtime::edno_runtime::init("edno:runtime".parse().unwrap()),
    ops::worker_host::edno_worker_host::init(
      Arc::new(|_| unreachable!("not used in snapshot.")),
      None,
    ),
    ops::fs_events::edno_fs_events::init(),
    ops::permissions::edno_permissions::init(),
    ops::tty::edno_tty::init(),
    ops::http::edno_http_runtime::init(),
    edno_bundle_runtime::edno_bundle_runtime::init(None),
    ops::desktop::edno_desktop::init(),
    ops::bootstrap::edno_bootstrap::init(None, false),
    runtime::init(),
    ops::web_worker::edno_web_worker::init(),
  ]
}

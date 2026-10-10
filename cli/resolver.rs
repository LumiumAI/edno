// Copyright 2018-2026 the Deno authors. MIT license.

use edno_resolver::npm::EdnoInNpmPackageChecker;
use node_resolver::EdnoIsBuiltInNodeModuleChecker;

use crate::npm::CliNpmResolver;
use crate::sys::CliSys;

pub type CliCjsTracker =
  edno_resolver::cjs::CjsTracker<EdnoInNpmPackageChecker, CliSys>;
pub type CliIsCjsResolver =
  edno_resolver::cjs::IsCjsResolver<EdnoInNpmPackageChecker, CliSys>;
pub type CliNpmReqResolver<TSys = CliSys> = edno_resolver::npm::NpmReqResolver<
  EdnoInNpmPackageChecker,
  EdnoIsBuiltInNodeModuleChecker,
  CliNpmResolver<TSys>,
  TSys,
>;
pub type CliResolver = edno_resolver::graph::EdnoResolver<
  EdnoInNpmPackageChecker,
  EdnoIsBuiltInNodeModuleChecker,
  CliNpmResolver,
  CliSys,
>;

pub fn on_resolve_diagnostic(
  diagnostic: edno_resolver::graph::MappedResolutionDiagnosticWithPosition,
) {
  log::warn!(
    "{} {}\n    at {}:{}",
    edno_runtime::colors::yellow("Warning"),
    diagnostic.diagnostic,
    diagnostic.referrer,
    diagnostic.start
  );
}

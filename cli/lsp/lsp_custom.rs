// Copyright 2018-2026 the Deno authors. MIT license.

use edno_core::serde::Deserialize;
use edno_core::serde::Serialize;
use tower_lsp::lsp_types as lsp;

pub const PERFORMANCE_REQUEST: &str = "edno/performance";
pub const INFERRED_TYPE_REQUEST: &str = "edno/inferredType";
pub const INFERRED_TYPE_COMMAND: &str = "edno.inferredType";
pub const TASK_REQUEST: &str = "edno/taskDefinitions";
pub const VIRTUAL_TEXT_DOCUMENT: &str = "edno/virtualTextDocument";

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InferredTypeParams {
  pub text_document: lsp::TextDocumentIdentifier,
  pub position: lsp::Position,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InferredTypeResponse {
  pub text: String,
  pub range: lsp::Range,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskDefinition {
  pub name: String,
  pub command: Option<String>,
  pub description: Option<String>,
  pub source_uri: lsp::Uri,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RegistryStateNotificationParams {
  pub origin: String,
  pub suggestions: bool,
}

pub enum RegistryStateNotification {}

impl lsp::notification::Notification for RegistryStateNotification {
  type Params = RegistryStateNotificationParams;

  const METHOD: &'static str = "edno/registryState";
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VirtualTextDocumentParams {
  pub text_document: lsp::TextDocumentIdentifier,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EdnoConfigurationData {
  pub scope_uri: lsp::Uri,
  pub workspace_root_scope_uri: Option<lsp::Uri>,
  pub edno_json: Option<lsp::TextDocumentIdentifier>,
  pub package_json: Option<lsp::TextDocumentIdentifier>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DidRefreshDenoConfigurationTreeNotificationParams {
  pub data: Vec<EdnoConfigurationData>,
  pub edno_dir_npm_folder_uri: Option<lsp::Uri>,
}

pub enum DidRefreshDenoConfigurationTreeNotification {}

impl lsp::notification::Notification
  for DidRefreshDenoConfigurationTreeNotification
{
  type Params = DidRefreshDenoConfigurationTreeNotificationParams;
  const METHOD: &'static str = "edno/didRefreshDenoConfigurationTree";
}

#[derive(Debug, Eq, Hash, PartialEq, Copy, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum EdnoConfigurationChangeType {
  Added,
  Changed,
  Removed,
}

impl EdnoConfigurationChangeType {
  pub fn from_file_change_type(file_event: lsp::FileChangeType) -> Self {
    match file_event {
      lsp::FileChangeType::CREATED => Self::Added,
      lsp::FileChangeType::CHANGED => Self::Changed,
      lsp::FileChangeType::DELETED => Self::Removed,
      _ => Self::Changed, // non-exhaustable enum
    }
  }
}

#[derive(Debug, Eq, Hash, PartialEq, Copy, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum EdnoConfigurationType {
  EdnoJson,
  PackageJson,
}

#[derive(Debug, Eq, Hash, PartialEq, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EdnoConfigurationChangeEvent {
  pub scope_uri: lsp::Uri,
  pub file_uri: lsp::Uri,
  #[serde(rename = "type")]
  pub typ: EdnoConfigurationChangeType,
  pub configuration_type: EdnoConfigurationType,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DidChangeDenoConfigurationNotificationParams {
  pub changes: Vec<EdnoConfigurationChangeEvent>,
}

// TODO(nayeemrmn): This is being replaced by
// `DidRefreshDenoConfigurationTreeNotification` for Edno > v2.0.0. Remove it
// soon.
pub enum DidChangeDenoConfigurationNotification {}

impl lsp::notification::Notification
  for DidChangeDenoConfigurationNotification
{
  type Params = DidChangeDenoConfigurationNotificationParams;
  const METHOD: &'static str = "edno/didChangeDenoConfiguration";
}

pub enum DidUpgradeCheckNotification {}

impl lsp::notification::Notification for DidUpgradeCheckNotification {
  type Params = DidUpgradeCheckNotificationParams;
  const METHOD: &'static str = "edno/didUpgradeCheck";
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpgradeAvailable {
  pub latest_version: String,
  pub is_canary: bool,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DidUpgradeCheckNotificationParams {
  pub upgrade_available: Option<UpgradeAvailable>,
}

/// This notification is only sent for testing purposes
/// in order to group diagnostics.
pub enum DiagnosticBatchStartNotification {}

impl lsp::notification::Notification for DiagnosticBatchStartNotification {
  type Params = ();
  const METHOD: &'static str = "edno/internalTestDiagnosticBatchStart";
}

/// This notification is only sent for testing purposes
/// in order to group diagnostics.
pub enum DiagnosticBatchEndNotification {}

impl lsp::notification::Notification for DiagnosticBatchEndNotification {
  type Params = ();
  const METHOD: &'static str = "edno/internalTestDiagnosticBatchEnd";
}

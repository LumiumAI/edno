// Regression test for a sandbox-escape via `op_desktop_send_error_report`.
//
// The op is exposed on `Edno[Edno.internal].core.ops` and survives
// `removeImportedOps()` (it's in NOT_IMPORTED_OPS), so untrusted code can
// call it in a plain `edno run`. It used to accept a caller-supplied `url`
// and, without any permission check, append to that `file://` path (a
// `--allow-write` bypass) or POST to that `https://` URL (a `--allow-net`
// bypass).
//
// It now ignores any caller-supplied destination and only ever targets the
// operator-configured `error_reporting_url`, which is unset here. So this
// attempt must be an inert no-op: the file must not be created even though
// the process has no `--allow-write`.
const target = new URL("pwned.txt", import.meta.url);

const { op_desktop_send_error_report } = Edno[Edno.internal].core.ops;
// Old exploit shape: (attacker file:// url, attacker body).
op_desktop_send_error_report(target.href, "malicious payload");

let existed = true;
try {
  Edno.statSync(target);
} catch (e) {
  if (e instanceof Edno.errors.NotFound) {
    existed = false;
  } else {
    throw e;
  }
}
console.log("pwned file exists:", existed);

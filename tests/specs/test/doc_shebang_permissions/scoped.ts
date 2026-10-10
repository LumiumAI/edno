/**
 * A scoped `--deny-*` can't be represented in the `Edno.test` permissions
 * object, so the example fails instead of running with broader permissions
 * than the shebang declares.
 *
 * ```ts
 * #!/usr/bin/env -S edno run --allow-read --deny-read=/etc
 * Edno.cwd();
 * ```
 * @module doc
 */

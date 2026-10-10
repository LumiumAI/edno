/**
 * The shebang only requests read access, so the inherited `--allow-env`
 * permission is revoked and accessing the environment fails.
 *
 * ```ts
 * #!/usr/bin/env -S edno run --allow-read
 * Edno.env.toObject();
 * ```
 *
 * `-A` inherits every permission from the test runner, so this example can
 * access the environment.
 *
 * ```ts
 * #!/usr/bin/env -S edno run -A
 * Edno.env.toObject();
 * ```
 * @module doc
 */

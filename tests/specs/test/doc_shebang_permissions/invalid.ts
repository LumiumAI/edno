/**
 * A shebang that is not a valid `edno` command fails the test rather than
 * running with inherited permissions.
 *
 * ```ts
 * #!/bin/sh
 * Edno.env.toObject();
 * ```
 * @module doc
 */

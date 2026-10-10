/**
 * This should succeed because we pass `--allow-env=PATH`
 * ```ts
 * const _path = Edno.env.get("PATH");
 * ```
 *
 * This should fail because we don't allow for env access to `USER`
 * ```ts
 * const _user = Edno.env.get("USER");
 * ```
 * @module doc
 */

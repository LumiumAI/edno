/**
 * Following import uses two distinct ways to provide types:
 * - X-TypeScript-Types headers
 * - @edno-types directive
 *
 * Because "@edno-types" directive must be placed by user explicitly it
 * should have higher precedence than type header.
 *
 * This is verified by providing conflicting type declaration
 * depending on a way. There should be no TS error, otherwise
 * it means that wrong type declarations are used (from X-TypeScript-Types)
 * header.
 */

// @edno-types="http://localhost:4545/run/type_headers_deno_types.foo.d.ts"
import { foo } from "http://localhost:4545/run/type_headers_deno_types.foo.js";

foo("hello");

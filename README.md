# Edno

**The end all be all JavaScript/TypeScript runtime.**

Edno is a JavaScript, TypeScript, and WebAssembly runtime with secure defaults,
built on [V8](https://v8.dev/), [Rust](https://www.rust-lang.org/), and
[Tokio](https://tokio.rs/). It keeps Deno's security model, standard library
support and Node.js compatibility while the toolchain moves to the oxc and
rolldown stack and the desktop pipeline becomes its own.

Edno is a fork of [Deno](https://deno.com). Deno ends development after one more
year of bug fix and security releases, and Edno continues that work
independently.

## Naming

The fork is early. The binary, the config file, the environment variables and
the `Deno` runtime namespace are still Deno's while the rename is in progress.
Renaming them changes the behavior of every existing script, so it is sequenced
deliberately rather than done first.

## Roadmap

Start with item 1. The rename rewrote every `Deno.` reference in the tree but no
`Edno` global exists yet, so the runtime does not start. Item 2 follows, then
the toolchain work.

- [ ] **1. `Edno` global with a `Deno` alias.** Every script and every fixture
      uses `Deno.` today. Ship `Edno` as canonical with `Deno` kept as a live
      alias, so nothing breaks.

- [ ] **2. `edno.json` back-compat discovery.** Read `deno.json` when no
      `edno.json` is present, so existing projects keep working on the first
      release.

- [ ] **3. Lint with oxlint.** Replace the SWC-based `deno_lint` with
      [oxlint](https://oxc.rs), reading `edno.json` and `.oxlintrc.json`
      natively. Keep `no-slow-types` and `no-sloppy-imports` on the current
      engine, because they resolve a module graph and oxlint has none.

- [ ] **4. Bundle with rolldown.** Replace esbuild behind the existing
      `BundleProvider` seam in `cli/tools/bundle/provider.rs`, with rolldown's
      options in `edno.json`. Read `vite.config.ts` and the framework configs in
      `cli/tools/framework.rs` so build settings are declared once.

- [ ] **5. One oxc-based AST.** Replace the SWC-based `deno_ast` with oxc's
      parser, linter and printer, so type stripping, lint and bundling share a
      single AST and a single parser in the binary.

- [ ] **6. JSR under an `@edno` scope.** JSR keeps running with Cloudflare
      infrastructure, so publish Edno's first-party packages and mirror `@std`.

- [ ] **7. Native packages for what `@std` lacks.** Publish JSR packages under
      `@edno` only where `@std` has no equivalent, since `@std` already covers
      glob (`fs` and `path`), hashing (`crypto`), and the rest of the pure
      TypeScript surface. The gaps worth filling are the database and network
      clients and the native utilities: `@edno/sql` for Postgres and MySQL,
      `@edno/valkey` for Redis, `@edno/watcher` for a native recursive watcher
      that `@std/fs` cannot do, `@edno/shell` and `@edno/markdown` as parsers
      `@std` only partially covers, and `@edno/image` for the codecs, EXIF,
      quantize and thumbhash that `@std/webgpu` does not provide. Bun's
      engine-agnostic Rust crates are the source for most of them. Skip every
      `*_jsc` crate, which is bound to JavaScriptCore, and every `*_sys` crate,
      which would duplicate the hyper, rustls and tokio stacks the runtime
      already links.

- [ ] **8. Bare specifiers resolve to npm.** Make
      `import express from "express"` work without the `npm:` prefix, matching
      Node. A bare specifier can also name an import map entry, a `node:`
      builtin or a JSR package, and choosing that precedence is the design work,
      not the implementation.

- [ ] **9. Own the desktop pipeline.** `edno desktop` already opens a native
      window through CEF, with a CDP multiplexer and framework detection for
      Vite, Next.js, Astro, Remix, SvelteKit, Nuxt, Fresh, SolidStart and
      TanStack Start. Build or vendor the backend binaries instead of
      downloading them from the `laufey` release channel, keep the application
      API stable, and reduce packaging to one command per platform.

- [ ] **10. Vitest compatibility.** Map `describe`, `it`, `expect`, `beforeEach`
      and `vi.fn` onto `Edno.test` and `std/assert`, keeping the op and resource
      sanitizers in `cli/tools/test/sanitizers.rs`. `vi.mock` is the exception,
      since it rewrites the graph and needs a real loader hook.

- [ ] **11. Native modules through Node-API.** `ext/napi` is already in the
      tree, so Bun and Deno native addons load unchanged. Publish a stable ABI
      so the ecosystem's prebuilt `.node` files work.

- [ ] **12. Playwright over the existing CDP mux.**
      `cli/tools/desktop_devtools.rs` already multiplexes CDP, so expose that
      port and Playwright can drive an Edno desktop app and its tests in one
      browser session.

### Deferred

Mobile is on hold. It depends on three unsolved problems at once, and it is the
only area with no desktop payoff.

- [ ] **1. Mobile.** rusty_v8 already cross-compiles to `aarch64-apple-ios` and
      `aarch64-apple-ios-sim`, choosing a jitless device build automatically
      because iOS withholds the JIT entitlement from non-WebKit apps. Ship
      device as interpreter-only with WebAssembly disabled, keep JIT on the
      simulator, then measure. Per `denoland/rusty_v8#1640` the runtime still
      needs its own work: drop FFI, gate webgpu, and route stdout to
      `__android_log_write` on Android.

- [ ] **2. A Swift and Objective-C bridge.** iOS has no writable-executable
      memory, so FFI cannot work there, which means reaching native iOS APIs
      through a generated Swift bridge. That replaces FFI on iOS rather than
      dropping the capability.

- [ ] **3. Mobile UI core modeled on PocketJS.** Adapt PocketJS's inverted
      embedding for Android and iOS: a small scripting guest plus a Rust core
      that lays out and draws, instead of a DOM, a CSS engine and a WebView. MIT
      licensed, and its architecture is the reference. This is the answer to
      jitless performance, because it moves the per-frame work out of the
      interpreter.

- [ ] **4. Offload protocol for mobile IO.** Adopt PocketJS's `io.offload` frame
      contract, where the guest submits bounded work to a paired provider that
      owns the socket, file and SQL handles, so IO waits leave the UI thread.
      Keep the fixed frame sizes, queue depths and deadlines, and keep JS
      completion callbacks to one per service pump tick.

- [ ] **5. Rust-first text and layout.** Use PocketJS's offload and
      ahead-of-time compilation ideas to push text shaping, layout and diffing
      into Rust, so jitless JS only submits intent rather than pixels.

### Research findings

Verified against upstream sources and the current crate docs.

- iOS is buildable today. rusty_v8 cross-compiles from an arm64 macOS host to
  `aarch64-apple-ios` and `aarch64-apple-ios-sim`, selecting a jitless device
  build with no extra GN args. The device target is interpreter-only and has
  WebAssembly disabled.
- The JIT dependency is the real blocker, not the toolchain. `ext/ffi`'s fast
  path is a tinycc-compiled trampoline over V8 Fast API calls, and callbacks
  need executable memory, so `--allow-ffi` is unusable on iOS. See
  `denoland/rusty_v8#1640` for the `__clear_cache` failure on Android.
- `ext/webgpu` vendors `wgpu_core` and `wgpu_types` directly. That is the real
  asset for any rendering work.
- `ext/canvas` is a scaffold: one op, `op_init_canvas`, with no drawing commands
  and no text measurement.
- There is no text shaping anywhere in the tree today. No harfbuzz, freetype,
  fontdb, swash or cosmic-text.
- Layout and shaping are imports, not builds. PocketJS uses `taffy 0.11` in
  `no_std` with `flexbox` and `content_size`, deliberately without grid, and
  `cosmic-text 0.19` with swash for text.
- The PocketJS UI core is roughly 21,000 lines of hand-written Rust covering the
  compositor, damage tracking, draw, raster, anim, tree, wire, resources and
  font streaming. That is the honest cost of a UI core.
- PocketJS validated the styling approach. A build-time Tailwind-subset scan
  assigns a numeric `styleId` to each class literal in the source AST, JS sends
  integers rather than strings, and Rust parses a binary `styles.bin` resolving
  defaults, then base, focus and active variants, then dynamic overrides, then
  live animation values. No cascade and no specificity.
- Copy their ambiguity rule. Sorted-token aliases are poisoned when `p-2 px-4`
  and `px-4 p-2` map to different records, so only verbatim lookups resolve.
- The guest never owns IO. PocketJS's wire discipline is that the host owns
  every socket and buffer while the module only interprets bytes.

## A first program

Until item 1 lands, replace `Edno` with `Deno` below. Both work once the alias
ships.

Create `server.ts`:

```ts
Edno.serve((_req: Request) => {
  return new Response("Hello, world!");
});
```

Run it:

```sh
edno run --allow-net server.ts
```

This starts a local web server on
[http://localhost:8000](http://localhost:8000).

## Building from source

Instructions for building the runtime are in
[.github/CONTRIBUTING.md](.github/CONTRIBUTING.md#building-from-source).

```sh
cargo build
./target/debug/edno run server.ts
```

## Additional resources

- **[Deno docs](https://docs.deno.com)**: written for Deno, and still the
  reference for the runtime Edno is forked from.
- **[JSR](https://jsr.io/)**: the open-source package registry for modern
  JavaScript and TypeScript.
- **[Deno standard library](https://jsr.io/@std)**: common utilities for
  programs running on this runtime.
- **[Bun](https://bun.com)**: upstream of the APIs and crates listed in roadmap
  item 7.

## Contributing

Contributions are welcome. Start with the
[contributing instructions](.github/CONTRIBUTING.md).

## License

MIT. Edno is derived from Deno, copyright the Deno authors.

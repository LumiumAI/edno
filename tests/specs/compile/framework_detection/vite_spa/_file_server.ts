// Local hermetic stand-in for `jsr:@std/http@^1/file-server` (remapped in
// `edno.json`) so the compile doesn't need network access. The generated
// entrypoint only imports `serveDir`; the real serving behavior is exercised by
// `@std/http`'s own tests.
//
// This module's top level runs when the generated entrypoint imports it, before
// that entrypoint reaches its blocking `Edno.serve`. The run step sets
// `EXIT_ON_LOAD` so the compiled binary boots — resolving this
// import-map-remapped specifier out of the embedded VFS — prints a marker, then
// exits cleanly instead of hanging the harness on a live server.
console.log("file-server stub loaded");
if (Edno.env.get("EXIT_ON_LOAD")) {
  Edno.exit(0);
}

export function serveDir(_req: Request): Promise<Response> {
  return Promise.resolve(new Response(null, { status: 404 }));
}

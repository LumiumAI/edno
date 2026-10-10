#!/usr/bin/env -S edno run -A --lock=tools/edno.lock.json
// Copyright 2018-2026 the Deno authors. MIT license.
// edno-lint-ignore-file no-console

// Purges the Cloudflare edge cache for mutable files on dl.deno.land.
//
// The `*-latest.txt` files live at a stable URL but change on every release,
// and the edge caches them for 4 hours. If anything requests one between the
// previous release and the new upload, the edge pins the old version and
// `edno upgrade` keeps handing out the previous release until the TTL expires.
//
// Usage: purge_cdn_cache.ts <file>...

const BASE_URL = "https://dl.deno.land";

// `edno upgrade` appends `?lsp` when the check comes from the LSP
// (see cli/tools/upgrade.rs). Cloudflare's cache key includes the query
// string, so that variant is a separate entry and needs its own purge.
const LSP_QUERY = "?lsp";

const files = Edno.args;
if (files.length === 0) {
  console.error("Usage: purge_cdn_cache.ts <file>...");
  Edno.exit(1);
}

const zoneId = Edno.env.get("CLOUDFLARE_ZONE_ID");
const apiToken = Edno.env.get("CLOUDFLARE_API_TOKEN");
if (!zoneId || !apiToken) {
  throw new Error(
    "CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN must both be set.",
  );
}

const urls = files.flatMap((file) => {
  const url = `${BASE_URL}/${file}`;
  return file.endsWith("-latest.txt") ? [url, url + LSP_QUERY] : [url];
});

console.error("Purging:");
for (const url of urls) {
  console.error("  " + url);
}

const response = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ files: urls }),
  },
);

const body = await response.text();
if (!response.ok) {
  throw new Error(`Purge failed (HTTP ${response.status}): ${body}`);
}

// Cloudflare reports failures in the body with a 200 status, so the status
// code alone is not enough to tell whether the purge actually happened.
const result = JSON.parse(body);
if (!result.success) {
  throw new Error(`Purge failed: ${body}`);
}

console.error("Purged", urls.length, "URL(s).");

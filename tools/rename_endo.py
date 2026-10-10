#!/usr/bin/env python3
"""
Rename Deno -> Edno across the tree.

Strategy: placeholder protection. Protected tokens (external crates we don't own,
upstream URLs that must keep working) are swapped for sentinels BEFORE any rename
happens, then restored afterward. This makes a naive global rename safe.

Usage:
  python3 tools/rename_endo.py --dry-run
  python3 tools/rename_endo.py --apply
"""

import argparse
import os
import re
import subprocess
import sys

PROTECT_FILE = ".rename-protect.txt"

# Extensions we rewrite. Binary and lock files are handled separately or skipped.
TEXT_EXT = {
    ".rs", ".ts", ".js", ".mjs", ".cjs", ".tsx", ".jsx",
    ".json", ".jsonc", ".toml", ".md", ".txt", ".out", ".snap",
    ".yml", ".yaml", ".html", ".css", ".scss", ".sh", ".ps1",
    ".cmake", ".nix", ".py", ".d.ts", ".snap.new", ".test",
}
# Files with no extension that are still text and matter.
TEXT_NAMES = {
    "LICENSE.md", "Dockerfile", "Makefile", "justfile", ".gitignore",
    ".gitattributes", ".npmrc", "rust-toolchain.toml",
}
SKIP_NAMES = {"Cargo.lock", "flake.lock", ".rename-protect.txt", "rename_endo.py"}

# Ordered rename rules. Longest / most specific first.
# Each entry: (pattern, replacement, is_regex)
RULES = [
    # Environment variables (uppercase) first, before bare DENO.
    (re.compile(r"\bDENO_"), "EDNO_", False),
    (re.compile(r"\bDENO\b"), "EDNO", False),
    # Crate / module identifiers with separators.
    (re.compile(r"\bdeno_core_icudata\b"), "\x00P00\x00", False),   # protect (external)
    (re.compile(r"\bdeno_"), "edno_", False),
    # Config file names.
    (re.compile(r"\bdeno\.jsonc\b"), "edno.jsonc", False),
    (re.compile(r"\bdeno\.json\b"), "edno.json", False),
    (re.compile(r"\bdeno\.lock\b"), "edno.lock", False),
    # CamelCase / PascalCase identifiers (Deno.serve, DenoFoo, denoFoo).
    (re.compile(r"\bDeno"), "Edno", False),
    (re.compile(r"\bdeno"), "edno", False),
    # Directory / binary names used as bare words.
    (re.compile(r"\bDENO\b"), "EDNO", False),
]


def load_protected():
    if not os.path.exists(PROTECT_FILE):
        sys.exit(f"missing {PROTECT_FILE}")
    with open(PROTECT_FILE) as fh:
        return [ln.strip() for ln in fh if ln.strip() and not ln.startswith("#")]


def build_sentinel_map(protected):
    return {tok: f"\x00P{i:02d}\x00" for i, tok in enumerate(protected)}


def is_text_file(path):
    base = os.path.basename(path)
    if base in SKIP_NAMES:
        return False
    if base in TEXT_NAMES:
        return True
    ext = os.path.splitext(base)[1]
    if ext in TEXT_EXT:
        return True
    # Extensionless: sniff for NUL bytes to avoid binaries.
    try:
        with open(path, "rb") as fh:
            return b"\x00" not in fh.read(4096)
    except OSError:
        return False


def transform(text, sentinel_map, protected):
    # 1. protect
    for tok, sentinel in sentinel_map.items():
        text = text.replace(tok, sentinel)
    # 2. rename
    for pattern, repl, _ in RULES:
        text = pattern.sub(repl, text)
    # 3. restore
    for tok, sentinel in sentinel_map.items():
        text = text.replace(sentinel, tok)
    return text


def git_files():
    out = subprocess.check_output(["git", "ls-files"], text=True)
    return [p for p in out.split("\n") if p]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()
    if args.dry_run == args.apply:
        sys.exit("pass exactly one of --dry-run / --apply")

    protected = load_protected()
    sentinel_map = build_sentinel_map(protected)
    files = git_files()
    if args.limit:
        files = files[: args.limit]

    changed = []
    total_edits = 0
    for path in files:
        if not os.path.exists(path):
            continue
        if not is_text_file(path):
            continue
        try:
            with open(path, "r", encoding="utf-8") as fh:
                original = fh.read()
        except (UnicodeDecodeError, OSError):
            continue
        updated = transform(original, sentinel_map, protected)
        if updated == original:
            continue
        # Count rough edits for reporting.
        diffs = sum(1 for a, b in zip(original.split("\n"), updated.split("\n")) if a != b)
        total_edits += diffs
        changed.append((path, diffs))
        if args.apply:
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(updated)

    changed.sort(key=lambda x: -x[1])
    print(f"files changed: {len(changed)}   line-edits: {total_edits}")
    for path, n in changed[:40]:
        print(f"  {n:6d}  {path}")
    if len(changed) > 40:
        print(f"  ... and {len(changed) - 40} more")


if __name__ == "__main__":
    main()
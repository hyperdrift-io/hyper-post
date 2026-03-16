#!/usr/bin/env bash

set -euo pipefail

if [[ -n "${CI:-}" ]]; then
  exit 0
fi

if ! command -v git >/dev/null 2>&1; then
  exit 0
fi

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  exit 0
fi

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

git config core.hooksPath .githooks
printf 'Configured git hooks for %s\n' "$repo_root"
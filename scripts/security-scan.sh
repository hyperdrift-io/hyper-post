#!/usr/bin/env bash

set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is required to run the tracked-file secret scan"
  exit 1
fi

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks is required to run the tracked-file secret scan. Install it with: brew install gitleaks"
  exit 1
fi

repo_root=$(git rev-parse --show-toplevel)
tmpdir=$(mktemp -d)

cleanup() {
  rm -rf "$tmpdir"
}

trap cleanup EXIT

while IFS= read -r -d '' path; do
  mkdir -p "$tmpdir/$(dirname "$path")"
  cp "$repo_root/$path" "$tmpdir/$path"
done < <(git -C "$repo_root" ls-files -z)

gitleaks detect --source "$tmpdir" --no-git --redact --no-banner
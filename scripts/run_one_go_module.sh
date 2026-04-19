#!/usr/bin/env bash
# Run 'go test' in the directory containing the given go.mod.
# Usage: run_one_go_module.sh <path/to/go.mod>
set -e
modfile="$1"
dir=$(dirname "$modfile")
if ! ( cd "$dir" && go test ./... ) >/dev/null 2>&1; then
    echo "FAIL: $dir"
    ( cd "$dir" && go test ./... ) 2>&1 | tail -20
    exit 1
fi

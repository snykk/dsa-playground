#!/usr/bin/env bash
# Run a single Python _test.py file in its own directory.
# Usage: run_one_python_test.sh <path/to/foo_test.py>
set -e
testfile="$1"
dir=$(dirname "$testfile")
module=$(basename "$testfile" .py)
if ! ( cd "$dir" && python3 -m unittest "$module" ) >/dev/null 2>&1; then
    echo "FAIL: $testfile"
    ( cd "$dir" && python3 -m unittest "$module" ) 2>&1 | tail -20
    exit 1
fi

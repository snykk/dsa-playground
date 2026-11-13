#!/usr/bin/env bash
# Run a single Python _test.py file in its own directory with a hard timeout.
# Usage: run_one_python_test.sh <path/to/foo_test.py>
#
# A timeout fails the test loudly instead of hanging the whole CI run.
# Tests that legitimately need longer than 120s should be marked @unittest.skip
# in CI or split into faster cases.
set -e
testfile="$1"
dir=$(dirname "$testfile")
module=$(basename "$testfile" .py)

# Prefer GNU `timeout` (Ubuntu CI default) or `gtimeout` (macOS via coreutils).
# Fall back to no timeout when neither is available.
TIMEOUT=""
if command -v timeout >/dev/null 2>&1; then
    TIMEOUT="timeout 120"
elif command -v gtimeout >/dev/null 2>&1; then
    TIMEOUT="gtimeout 120"
fi

# Announce which test we're running so a hung suite shows the culprit in CI logs.
echo "PYTHON: $testfile"

if ! ( cd "$dir" && $TIMEOUT python3 -m unittest "$module" ) >/dev/null 2>&1; then
    rc=$?
    if [ "$rc" = "124" ]; then
        echo "TIMEOUT: $testfile (exceeded 120s)"
    else
        echo "FAIL: $testfile"
        ( cd "$dir" && $TIMEOUT python3 -m unittest "$module" ) 2>&1 | tail -20
    fi
    exit 1
fi

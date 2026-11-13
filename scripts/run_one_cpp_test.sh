#!/usr/bin/env bash
# Compile and run a single *_test.cpp file.
# Usage: run_one_cpp_test.sh <path/to/foo_test.cpp> <build_dir>
set -e
testfile="$1"
build_dir="${2:-.build/cpp}"
dir=$(dirname "$testfile")
name=$(basename "$testfile" .cpp)
safe=$(echo "$dir/$name" | tr "/ +" "___")
repo_root=$(pwd)
bin="$repo_root/$build_dir/$safe"

mkdir -p "$build_dir"
CXX=${CXX:-g++}
# IS_TEST_BUILD silences demo main() in impl .cpp files that include themselves.
CXXFLAGS=${CXXFLAGS:--std=c++17 -O2 -Wall -DIS_TEST_BUILD}

if ! ( cd "$dir" && $CXX $CXXFLAGS "$(basename "$testfile")" -o "$bin" ) 2>/dev/null; then
    echo "COMPILE FAIL: $testfile"
    ( cd "$dir" && $CXX $CXXFLAGS "$(basename "$testfile")" -o "$bin" ) 2>&1 | tail -20
    exit 1
fi
# A hard timeout, as for the Python tests: GNU `timeout` (Ubuntu CI) or `gtimeout`
# (macOS via coreutils); without either the binary runs unbounded.
TIMEOUT=""
if command -v timeout >/dev/null 2>&1; then
    TIMEOUT="timeout 120"
elif command -v gtimeout >/dev/null 2>&1; then
    TIMEOUT="gtimeout 120"
fi

rc=0
$TIMEOUT "$bin" >/dev/null 2>&1 || rc=$?
if [ "$rc" = "124" ]; then
    echo "TIMEOUT: $testfile (exceeded 120s)"
    exit 1
elif [ "$rc" != "0" ]; then
    echo "RUNTIME FAIL: $testfile"
    $TIMEOUT "$bin" 2>&1 | tail -20
    exit 1
fi

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
CXXFLAGS=${CXXFLAGS:--std=c++17 -O2 -Wall}

if ! ( cd "$dir" && $CXX $CXXFLAGS "$(basename "$testfile")" -o "$bin" ) 2>/dev/null; then
    echo "COMPILE FAIL: $testfile"
    ( cd "$dir" && $CXX $CXXFLAGS "$(basename "$testfile")" -o "$bin" ) 2>&1 | tail -20
    exit 1
fi
if ! "$bin" >/dev/null 2>&1; then
    echo "RUNTIME FAIL: $testfile"
    "$bin" 2>&1 | tail -20
    exit 1
fi

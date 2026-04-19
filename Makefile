# DSA Playground — cross-language test runner.
#
# Usage:
#     make test             # run all tests (Python + Go + C++)
#     make test-python      # run all Python unittest files
#     make test-go          # run 'go test' in every module
#     make test-cpp         # compile and run every *_test.cpp
#     make clean            # remove build artifacts
#
# Any failing test exits the target with non-zero status, so CI can rely
# on `make test`. Per-test execution logic lives in scripts/ to keep this
# Makefile portable (xargs on macOS chokes on overly long -I expansions).

SHELL := /bin/bash
JOBS  ?= 4

BUILD_DIR := .build
CPP_BIN_DIR := $(BUILD_DIR)/cpp

.PHONY: test test-python test-go test-cpp clean help

help:
	@echo "Available targets:"
	@echo "  test         run Python + Go + C++ test suites"
	@echo "  test-python  run all Python unittest files"
	@echo "  test-go      run 'go test' in every directory containing a go.mod"
	@echo "  test-cpp     compile and run every *_test.cpp"
	@echo "  clean        remove compiled C++ binaries and caches"

test: test-python test-go test-cpp
	@echo ""
	@echo "=========================================="
	@echo "  ALL TESTS PASSED"
	@echo "=========================================="

test-python:
	@echo "=========================================="
	@echo "  PYTHON ($(JOBS) parallel jobs)"
	@echo "=========================================="
	@find . -type f -name "*_test.py" \
		-not -path "*/.venv/*" \
		-not -path "*/__pycache__/*" \
		-not -path "*/$(BUILD_DIR)/*" \
		-print0 | \
	xargs -0 -n1 -P$(JOBS) ./scripts/run_one_python_test.sh || \
		{ echo "    Python tests FAILED"; exit 1; }
	@echo "    Python OK"

test-go:
	@echo "=========================================="
	@echo "  GO ($(JOBS) parallel jobs)"
	@echo "=========================================="
	@find . -type f -name "go.mod" \
		-not -path "*/.git/*" \
		-print0 | \
	xargs -0 -n1 -P$(JOBS) ./scripts/run_one_go_module.sh || \
		{ echo "    Go tests FAILED"; exit 1; }
	@echo "    Go OK"

test-cpp:
	@echo "=========================================="
	@echo "  C++ ($(JOBS) parallel jobs)"
	@echo "=========================================="
	@mkdir -p $(CPP_BIN_DIR)
	@find . -type f -name "*_test.cpp" \
		-not -path "*/.git/*" \
		-not -path "*/$(BUILD_DIR)/*" \
		-print0 | \
	xargs -0 -n1 -P$(JOBS) ./scripts/run_one_cpp_test.sh || \
		{ echo "    C++ tests FAILED"; exit 1; }
	@echo "    C++ OK"

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name "*.exe" -not -path "*/.git/*" -delete 2>/dev/null || true
	@echo "Done."

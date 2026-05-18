#!/usr/bin/env python3
"""Audit C++ impl files for malformed IS_TEST_BUILD guards.

A correct file has the guard outside any block comment. If the wrap script
inserted #ifndef IS_TEST_BUILD inside a /* ... */ block, the matching #endif
at end of file becomes stray. Detect those cases here.
"""

from pathlib import Path
import re


def _strip_block_comments(text: str) -> str:
    out = []
    i = 0
    while i < len(text):
        if text[i:i + 2] == "/*":
            end = text.find("*/", i + 2)
            if end == -1:
                break
            i = end + 2
        else:
            out.append(text[i])
            i += 1
    return "".join(out)


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    bad: list[Path] = []
    for cpp in root.rglob("*.cpp"):
        if cpp.name.endswith("_test.cpp"):
            continue
        text = cpp.read_text(encoding="utf-8", errors="replace")
        if "IS_TEST_BUILD" not in text:
            continue
        stripped = _strip_block_comments(text)
        # Count guards outside comments
        n_ifndef = stripped.count("#ifndef IS_TEST_BUILD")
        n_endif = stripped.count("#endif  // !IS_TEST_BUILD")
        if n_ifndef != n_endif:
            bad.append((cpp, n_ifndef, n_endif))
    for f, ni, ne in bad:
        print(f"MALFORMED: {f.relative_to(root)} (ifndef={ni}, endif={ne})")
    if not bad:
        print("All guards balanced.")
    return 0 if not bad else 1


if __name__ == "__main__":
    raise SystemExit(main())

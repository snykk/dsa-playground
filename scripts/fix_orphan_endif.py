#!/usr/bin/env python3
"""Fix files where the wrap script inserted #ifndef IS_TEST_BUILD inside a
/* ... */ block comment. The matching #endif at end of file becomes stray
("#endif without #if") since the preprocessor never sees the #ifndef.

The fix: for each unbalanced file, remove the trailing
    #endif  // !IS_TEST_BUILD
line (the only one outside the comment block).

The orphaned `#ifndef IS_TEST_BUILD` inside the comment is harmless and is
left in place.
"""

from pathlib import Path


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
    fixed = 0
    for cpp in root.rglob("*.cpp"):
        if cpp.name.endswith("_test.cpp"):
            continue
        text = cpp.read_text(encoding="utf-8", errors="replace")
        if "IS_TEST_BUILD" not in text:
            continue
        stripped = _strip_block_comments(text)
        n_if = stripped.count("#ifndef IS_TEST_BUILD")
        n_end = stripped.count("#endif  // !IS_TEST_BUILD")
        if n_if == n_end:
            continue
        # Unbalanced -- remove the stray #endif line.
        new_lines = []
        removed = 0
        for line in text.splitlines(keepends=True):
            if line.strip() == "#endif  // !IS_TEST_BUILD" and removed < (n_end - n_if):
                removed += 1
                continue
            new_lines.append(line)
        cpp.write_text("".join(new_lines), encoding="utf-8")
        fixed += 1
        print(f"fixed: {cpp.relative_to(root)}")
    print(f"\nTotal fixed: {fixed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

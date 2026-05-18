#!/usr/bin/env python3
"""Wrap demo main() in C++ implementation files with #ifndef IS_TEST_BUILD.

Many .cpp implementation files in this repo end with an `int main()` block
for ad-hoc demo runs. The corresponding *_test.cpp files do `#include
"impl.cpp"` to pull in the implementation, which causes a duplicate-main
linker error.

This script finds every impl .cpp that:
  1. Has a sibling *_test.cpp in the same directory, AND
  2. Contains a top-level `int main()` definition,

then wraps that main() with `#ifndef IS_TEST_BUILD` / `#endif` guards.
The test script must compile with `-DIS_TEST_BUILD`.

Idempotent: re-running on already-wrapped files is a no-op.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


def find_impl_files(root: Path) -> list[Path]:
    """Return impl .cpp files that have a sibling *_test.cpp."""
    impl_files = []
    for cpp in root.rglob("*.cpp"):
        if cpp.name.endswith("_test.cpp"):
            continue
        # Heuristic: a "_test.cpp" sibling means this is an impl file.
        siblings = list(cpp.parent.glob("*_test.cpp"))
        if not siblings:
            continue
        # Skip if the sibling doesn't include us.
        included = False
        for sib in siblings:
            content = sib.read_text(encoding="utf-8", errors="replace")
            if f'#include "{cpp.name}"' in content:
                included = True
                break
        if included:
            impl_files.append(cpp)
    return sorted(impl_files)


MAIN_RE = re.compile(r"^int\s+main\s*\(", re.MULTILINE)
GUARD_BEGIN = "#ifndef IS_TEST_BUILD\n"
GUARD_END = "#endif  // !IS_TEST_BUILD\n"


def is_already_wrapped(text: str) -> bool:
    return "IS_TEST_BUILD" in text


def _strip_block_comments(text: str) -> str:
    """Return `text` with /* ... */ blocks removed. String literals containing
    those tokens would also be stripped, but our impl files don't embed comment
    markers inside strings."""
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


def wrap_main(text: str) -> tuple[str, bool]:
    """Return (new_text, changed). Wraps the last `int main(` block with guards.

    Skip files whose only `int main(` sits inside a /* ... */ block comment —
    those are commented-out demos that don't need guarding.
    """
    if is_already_wrapped(text):
        return text, False
    matches = list(MAIN_RE.finditer(text))
    if not matches:
        return text, False
    # Verify the last match isn't inside a block comment.
    stripped = _strip_block_comments(text)
    if not MAIN_RE.search(stripped):
        return text, False
    # Use the last match: in our files, demo main() is always the final
    # top-level function. (If there are multiple matches, only the last is
    # the demo; earlier ones could be inside #if 0 or comments — but in
    # practice each impl has at most one main.)
    m = matches[-1]
    insert_at = m.start()
    # Find the line start (handles preceding indentation, though main is
    # always column 0 in our files).
    line_start = text.rfind("\n", 0, insert_at) + 1
    new_text = (
        text[:line_start]
        + GUARD_BEGIN
        + text[line_start:].rstrip("\n")
        + "\n"
        + GUARD_END
    )
    return new_text, True


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    impl_files = find_impl_files(root)
    changed = 0
    for f in impl_files:
        text = f.read_text(encoding="utf-8", errors="replace")
        new_text, did_change = wrap_main(text)
        if did_change:
            f.write_text(new_text, encoding="utf-8")
            changed += 1
            print(f"wrapped: {f.relative_to(root)}")
    print(f"\nTotal wrapped: {changed} / {len(impl_files)} impl files")
    return 0


if __name__ == "__main__":
    sys.exit(main())

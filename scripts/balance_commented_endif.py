#!/usr/bin/env python3
"""Balance #ifndef / #endif inside commented-out demo blocks.

Many impl .cpp files have a demo `main()` parked inside a /* ... */ comment
block, preceded by both `#ifndef TESTING` and `#ifndef IS_TEST_BUILD` but
with only a single trailing `#endif` -- the inner `#endif` for the second
guard was missing.

The preprocessor doesn't see the directives inside the comment so they
don't affect compilation, but the imbalance is ugly when reading the
source and confuses static analyzers. Add the missing `#endif` so each
commented block is self-balanced.

Idempotent -- re-runs are no-ops once balanced.
"""
import re
from pathlib import Path


def fix_block(block: str) -> tuple[str, bool]:
    n_if = len(re.findall(r"^\s*#ifn?def\b", block, re.MULTILINE))
    n_end = len(re.findall(r"^\s*#endif\b", block, re.MULTILINE))
    if n_if <= n_end or n_if == 0:
        return block, False
    missing = n_if - n_end
    # Append the missing #endif lines just before any trailing whitespace.
    trail_match = re.search(r"\s*$", block)
    if trail_match:
        trail = trail_match.group(0)
        body = block[: trail_match.start()]
    else:
        trail = ""
        body = block
    extra = ("\n" + "\n".join(["#endif"] * missing))
    return body + extra + trail, True


def fix_text(text: str) -> tuple[str, bool]:
    pattern = re.compile(r"(/\*)(.*?)(\*/)", re.DOTALL)
    changed = False

    def replace(m: re.Match) -> str:
        nonlocal changed
        new_body, did = fix_block(m.group(2))
        if did:
            changed = True
        return m.group(1) + new_body + m.group(3)

    return pattern.sub(replace, text), changed


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    fixed = 0
    for cpp in root.rglob("*.cpp"):
        if cpp.name.endswith("_test.cpp"):
            continue
        text = cpp.read_text(encoding="utf-8", errors="replace")
        if "IS_TEST_BUILD" not in text or "/*" not in text:
            continue
        new_text, changed = fix_text(text)
        if changed:
            cpp.write_text(new_text, encoding="utf-8")
            fixed += 1
            print(f"balanced: {cpp.relative_to(root)}")
    print(f"\nTotal balanced: {fixed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

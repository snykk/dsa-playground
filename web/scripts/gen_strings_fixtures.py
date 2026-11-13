"""Generate golden string-search fixtures from the repository's Python implementations.

The web visualizer re-implements naive search, Rabin-Karp, Boyer-Moore and the
Z-algorithm in TypeScript (web/src/viz/algorithms/stringSearch.ts and
zAlgorithm.ts). These fixtures pin the ports to the reference code in
Algorithms/String_Algorithms/Pattern_Matching/*/Python and
Algorithms/String_Algorithms/Advanced_String/Z_Algorithm/Python.

Besides each result, a case records `reads`: every integer index the Python
function reads from the text (or, for the Z-array, from the string), in order.
That pins the exact comparisons, hash rolls and shifts, so the animation shows
what the repository code does, not just the same answer. Run from anywhere:

    python3 web/scripts/gen_strings_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/strings.json. CI regenerates
the file and fails if it changed, which means the implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STRINGS = ROOT / "Algorithms" / "String_Algorithms"
for folder in (
    STRINGS / "Pattern_Matching" / "Naive_Pattern_Search" / "Python",
    STRINGS / "Pattern_Matching" / "Rabin_Karp_Algorithm" / "Python",
    STRINGS / "Pattern_Matching" / "Boyer_Moore_Algorithm" / "Python",
    STRINGS / "Advanced_String" / "Z_Algorithm" / "Python",
):
    sys.path.insert(0, str(folder))

from boyer_moore import boyer_moore_search, build_bad_char_table  # noqa: E402
from naive_pattern_search import naive_pattern_search  # noqa: E402
from rabin_karp import rabin_karp_search  # noqa: E402
from z_algorithm import build_z_array, z_algorithm_search  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "strings.json"

# Limits of the visualizations (see parseSearch / parseZ in the TypeScript).
MAX_TEXT, MAX_PATTERN = 40, 15
MAX_Z_STRING, MAX_Z_TEXT, MAX_Z_PATTERN = 32, 30, 10


class RecordingStr(str):
    """A str that logs every integer index read through s[i]."""

    def __new__(cls, value, log):
        obj = super().__new__(cls, value)
        obj.log = log
        return obj

    def __getitem__(self, key):
        if isinstance(key, int):
            self.log.append(key)
        return str.__getitem__(self, key)


def recorded(fn, text, *args):
    reads = []
    result = fn(RecordingStr(text, reads), *args)
    return result, reads


def word(rng, alphabet, lo, hi):
    return "".join(rng.choice(alphabet) for _ in range(rng.randint(lo, hi)))


def search_pairs(rng, count):
    """Random (text, pattern) pairs within the visualization limits."""
    alphabets = ["ab", "abc", "abcd", "aab", "ab$", "abcdefgh", "ACGT", "a" + chr(0xE9) + chr(0x3B1)]
    pairs = []
    for _ in range(count):
        alphabet = rng.choice(alphabets)
        text = word(rng, alphabet, 1, MAX_TEXT)
        pattern = word(rng, alphabet[: rng.randint(1, len(alphabet))], 1, rng.choice([3, 6, MAX_PATTERN]))
        if rng.random() < 0.5 and len(pattern) <= len(text):
            at = rng.randrange(len(text) - len(pattern) + 1)  # plant an occurrence
            text = text[:at] + pattern + text[at + len(pattern):]
        pairs.append((text, pattern))
    return pairs


FIXED_PAIRS = [
    ("AABAACAADAABAABA", "AABA"),
    ("ABABDABACDABABCABC", "ABABCABC"),
    ("HERE IS A SIMPLE EXAMPLE", "EXAMPLE"),
    ("AAAAAAAAAAAAAAAAAAAB", "AAAAB"),
    ("AAAAAAAAAAAA", "BAAA"),
    ("ABCXABCXABCXABC", "ABC"),
    ("AAAAAA", "AAA"),
    ("ABC", "ABCD"),
    ("a", "a"),
]


def make_cases():
    rng = random.Random(20261110)
    pairs = FIXED_PAIRS + search_pairs(rng, 70)

    naive = []
    for text, pattern in pairs:
        matches, reads = recorded(naive_pattern_search, text, pattern)
        naive.append({"text": text, "pattern": pattern, "matches": matches, "reads": reads})

    rabin_karp = []
    for k, (text, pattern) in enumerate(pairs):
        mod = [101, 1, 2, 7, 13, 101, 997][k % 7]
        matches, reads = recorded(rabin_karp_search, text, pattern, 256, mod)
        rabin_karp.append({"text": text, "pattern": pattern, "mod": mod, "matches": matches, "reads": reads})

    boyer_moore = []
    for text, pattern in pairs:
        matches, reads = recorded(boyer_moore_search, text, pattern)
        table = [[c, last] for c, last in build_bad_char_table(pattern).items()]
        boyer_moore.append({"text": text, "pattern": pattern, "table": table, "matches": matches, "reads": reads})

    z_array = []
    strings = ["aabxaabxcaabxaabxay", "aaaaaa", "abacabadabacaba", "abcdef", "a", "ab$ab$a$"]
    strings += [word(rng, rng.choice(["ab", "aab", "abc", "a$b"]), 1, MAX_Z_STRING) for _ in range(50)]
    for s in strings:
        z, reads = recorded(build_z_array, s)
        z_array.append({"s": s, "z": z, "reads": reads})

    z_search = []
    z_pairs = [("a$a", "a"), ("$$", "$"), ("ab$ab", "ab"), ("AABAACAADAABAABA", "AABA"), ("ab", "abc")]
    for _ in range(50):
        alphabet = rng.choice(["ab", "ab$", "a$", "abc"])
        z_pairs.append((word(rng, alphabet, 1, MAX_Z_TEXT), word(rng, alphabet, 1, rng.choice([2, 4, MAX_Z_PATTERN]))))
    for text, pattern in z_pairs:
        z_search.append({"text": text, "pattern": pattern, "matches": z_algorithm_search(text, pattern)})

    return {
        "naive": naive,
        "rabin_karp": rabin_karp,
        "boyer_moore": boyer_moore,
        "z_array": z_array,
        "z_search": z_search,
    }


def main():
    sections = make_cases()
    header = {
        "generator": "web/scripts/gen_strings_fixtures.py",
        "reference": "Algorithms/String_Algorithms/{Pattern_Matching/*,Advanced_String/Z-Algorithm}/Python",
        "reads": "integer indices read from the text (Z-array: from the string), in order",
    }
    parts = []
    for name, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(name) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    total = sum(len(c) for c in sections.values())
    print(f"wrote {total} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

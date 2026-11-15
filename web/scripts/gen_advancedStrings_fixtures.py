"""Generate golden advanced-string fixtures from the repository's Python implementations.

The web visualizer re-implements four topics of Algorithms/String_Algorithms/Advanced_String
in TypeScript (web/src/viz/algorithms/): Aho-Corasick (ahoCorasick.ts), the longest common
substring (longestCommonSubstring.ts), Manacher's algorithm (manacher.ts) and the suffix
array (suffixArray.ts). These fixtures pin each port to its reference in
Advanced_String/<topic>/Python:

- aho: the trie (every node in creation order with its parent, character, failure link,
  output link and patterns), every `char in node.children` test the build and the search
  make, in order (the trie's dicts are swapped for recording dicts), and the matches in the
  order search returns them;
- lcs: the whole dp table at return and the result tuple;
- manacher: the transformed string, the radius array p, (center, right) at the start of
  every loop iteration, and the result tuple;
- suffix: the suffix array, and for every search the indices search_pattern reads from the
  suffix array (the binary-search probes, then the block it collects) and its result, and
  longest_common_prefix results.

The dp table, p and (center, right) are local variables, read with sys.settrace when the
function returns or starts a loop iteration; the repository code is never modified.
Run from anywhere:

    python3 web/scripts/gen_advancedStrings_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/advancedStrings.json. CI regenerates the file
and fails if it changed, which means the implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ADV = ROOT / "Algorithms" / "String_Algorithms" / "Advanced_String"
for folder in ("Aho_Corasick", "Longest_Common_Substring", "Longest_Palindromic_Substring_Manachers", "Suffix_Array"):
    sys.path.insert(0, str(ADV / folder / "Python"))

import aho_corasick  # noqa: E402
from longest_common_substring import longest_common_substring  # noqa: E402
from manacher import manacher  # noqa: E402
from suffix_array import build_suffix_array, longest_common_prefix, search_pattern  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "advancedStrings.json"
RNG = random.Random(20261115)


def word(alphabet, lo, hi):
    return "".join(RNG.choice(alphabet) for _ in range(RNG.randint(lo, hi)))


# ---------- Aho-Corasick ----------


class RecordingDict(dict):
    """A node's children: logs every `char in children` test as [node id, char, result]."""

    def __init__(self, log, nid):
        super().__init__()
        self.log = log
        self.nid = nid

    def __contains__(self, key):
        result = dict.__contains__(self, key)
        self.log.append([self.nid, key, result])
        return result


def aho_case(patterns, text):
    log = []
    created = []

    class RecordingNode(aho_corasick._Node):
        __slots__ = ("nid",)

        def __init__(self):
            super().__init__()
            self.nid = len(created)
            self.children = RecordingDict(log, self.nid)
            created.append(self)

    original = aho_corasick._Node
    aho_corasick._Node = RecordingNode
    try:
        ac = aho_corasick.AhoCorasick(list(patterns))
        build_checks = list(log)
        del log[:]
        matches = ac.search(text)
        scan_checks = list(log)
    finally:
        aho_corasick._Node = original

    parent = {0: None}
    char = {0: ""}
    for node in created:
        for c, child in dict.items(node.children):
            parent[child.nid] = node.nid
            char[child.nid] = c
    nodes = []
    for node in created:
        nodes.append(
            [
                parent[node.nid],
                char[node.nid],
                node.fail.nid if node.fail is not None else None,
                node.output.nid if node.output is not None else None,
                list(node.patterns),
                [child.nid for child in dict.values(node.children)],
            ]
        )
    return {
        "patterns": list(patterns),
        "text": text,
        "nodes": nodes,
        "buildChecks": build_checks,
        "scanChecks": scan_checks,
        "matches": [[i, p] for i, p in matches],
    }


AHO_FIXED = [
    (["he", "she", "his", "hers"], "ushers"),
    (["ab", "bc", "abc"], "abcabc"),
    (["ab", "abab", "aba"], "ababab"),
    (["abc", "abc"], "abc"),
    (["a", "b"], "aabba"),
    ([], "hello"),
    (["", "a", ""], "banana"),
    (["abc"], ""),
    (["a", "aa", "aaa"], "aaaa"),
    (["abcdef"], "xxabcdefxx"),
    (["acc", "atc", "cat", "gcg"], "gcatcg"),
    (["aba", "bab", "ca"], "abababaca"),
    (["i", "in", "tin", "sting"], "sting tin"),
    (["x", "yx", "zyx"], "zyxzyx"),
]


def aho_cases(count):
    cases = [aho_case(p, t) for p, t in AHO_FIXED]
    while len(cases) < count:
        alphabet = RNG.choice(["ab", "abc", "abcd", "aab"])
        patterns = [word(alphabet, 1, 4) for _ in range(RNG.randint(1, 6))]
        if RNG.random() < 0.15:
            patterns.append(RNG.choice(patterns))
        text = word(alphabet, 0, 16)
        cases.append(aho_case(patterns, text))
    return cases


# ---------- locals through sys.settrace ----------


def run_traced(fn, args, on_line=None):
    """Call fn(*args); return (result, locals at return). on_line(locals) runs on every line event."""
    code = fn.__code__
    captured = {}

    def local(frame, event, arg):
        if event == "line" and on_line is not None:
            on_line(frame.f_locals)
        elif event == "return":
            captured.update(frame.f_locals)
        return local

    def tracer(frame, event, arg):
        return local if frame.f_code is code else None

    sys.settrace(tracer)
    try:
        result = fn(*args)
    finally:
        sys.settrace(None)
    return result, captured


# ---------- longest common substring ----------


def lcs_case(s1, s2):
    result, local = run_traced(longest_common_substring, (s1, s2))
    return {"s1": s1, "s2": s2, "dp": local["dp"], "result": list(result)}


LCS_FIXED = [
    ("ABABC", "BABCA"),
    ("abcxyz", "xyzabc"),
    ("ABC", "XYZ"),
    ("", "ABC"),
    ("", ""),
    ("abcde", "ace"),
    ("banana", "banana"),
    ("xxabcxx", "abc"),
    ("abababaca", "bacab"),
    ("GeeksforGeeks", "GeeksQuiz"),
    ("aaaa", "aa"),
]


def lcs_cases(count):
    cases = [lcs_case(a, b) for a, b in LCS_FIXED]
    while len(cases) < count:
        alphabet = RNG.choice(["ab", "abc", "ACGT", "abcd"])
        cases.append(lcs_case(word(alphabet, 0, 12), word(alphabet, 0, 12)))
    return cases


# ---------- Manacher ----------


def manacher_case(s):
    starts = []
    seen = {"i": None}

    def on_line(local):
        # The first line event after `for i` takes a new value: (center, right) as the iteration
        # begins. The search for the maximum reuses i, so stop once max_len exists.
        if "max_len" in local:
            return
        if "i" in local and local["i"] != seen["i"] and "center" in local:
            seen["i"] = local["i"]
            starts.append([local["center"], local["right"]])

    result, local = run_traced(manacher, (s,), on_line)
    return {
        "s": s,
        "transformed": local.get("transformed", ""),
        "p": local.get("p", []),
        "starts": starts,
        "result": list(result),
    }


MANACHER_FIXED = ["babad", "cbbd", "", "a", "abc", "aaaa", "racecar", "b^a^b^a", "a^", "$a", "abacaba", "a#a", "forgeeksskeegfor", "abababaca"]


def manacher_cases(count):
    cases = [manacher_case(s) for s in MANACHER_FIXED]
    while len(cases) < count:
        cases.append(manacher_case(word(RNG.choice(["ab", "abc", "aab", "ab#"]), 1, 15)))
    return cases


# ---------- suffix array ----------


class RecordingList(list):
    """A suffix array that logs every integer index read through sa[i]."""

    def __init__(self, items, log):
        super().__init__(items)
        self.log = log

    def __getitem__(self, key):
        if isinstance(key, int):
            self.log.append(key)
        return list.__getitem__(self, key)


def suffix_case(text, patterns, pairs):
    sa = build_suffix_array(text)
    searches = []
    for pattern in patterns:
        reads = []
        result = search_pattern(RecordingList(sa, reads), text, pattern)
        searches.append({"pattern": pattern, "reads": reads, "result": result})
    lcps = [[i, j, longest_common_prefix(text, i, j)] for i, j in pairs]
    return {"text": text, "sa": sa, "searches": searches, "lcp": lcps}


SUFFIX_FIXED = [
    ("banana", ["ana", "a", "nan", "xyz", "bananas", "", "na"], [(0, 3), (1, 1), (3, 1), (2, 4)]),
    ("mississippi", ["issi", "ss", "i", "p", "mississippi", "x"], [(1, 4), (2, 3), (0, 10)]),
    ("aaaa", ["aa", "a", "aaaaa", ""], [(0, 1), (1, 3)]),
    ("", ["a", ""], []),
    ("abababaca", ["aba", "ca", "bab"], [(0, 2), (1, 5)]),
    ("Banana", ["a", "B", "b"], [(1, 3)]),
    ("a$b$", ["$", "b$"], [(1, 3)]),
]


def suffix_cases(count):
    cases = [suffix_case(t, p, q) for t, p, q in SUFFIX_FIXED]
    while len(cases) < count:
        alphabet = RNG.choice(["ab", "abc", "aab", "ab$"])
        text = word(alphabet, 1, 12)
        patterns = []
        for _ in range(RNG.randint(1, 5)):
            if RNG.random() < 0.6:
                i = RNG.randrange(len(text))
                patterns.append(text[i : i + RNG.randint(1, 4)])
            else:
                patterns.append(word(alphabet, 0, 4))
        pairs = [(RNG.randrange(len(text)), RNG.randrange(len(text))) for _ in range(RNG.randint(0, 3))]
        cases.append(suffix_case(text, patterns, pairs))
    return cases


def main():
    sections = {
        "aho": aho_cases(70),
        "lcs": lcs_cases(60),
        "manacher": manacher_cases(60),
        "suffix": suffix_cases(60),
    }
    header = {
        "generator": "web/scripts/gen_advancedStrings_fixtures.py",
        "reference": "Algorithms/String_Algorithms/Advanced_String/{Aho_Corasick,Longest_Common_Substring,Longest_Palindromic_Substring_Manachers,Suffix_Array}/Python",
    }
    parts = []
    for key, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(key) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    counts = ", ".join(f"{len(c)} {k}" for k, c in sections.items())
    print(f"wrote {counts} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

"""Generate golden fixtures for the string-structure visualizations from the repository's Python code.

The web visualizer re-implements the five string basics (String_Basics/Python/main.py), the
string manipulation functions (String_Manipulation/Python/string_manipulation.py) and the
rope (Rope/Python/rope.py) in TypeScript (web/src/viz/algorithms/stringBasics.ts,
stringManipulation.ts and rope.ts). These fixtures pin each port to its reference:

- basics, manipulation: the value every function returns (or the exception it raises) on
  tricky inputs: negative and out-of-range indexes, clamped slices, empty strings, empty
  separators, overlapping patterns, empty fields;
- rope: fixed and random edit scripts, with the whole tree after every operation (leaves in
  order and how they are grouped, so the AVL join's rotations are pinned), the cached
  length and height of the root, and every index or split result.

Run from anywhere:

    python3 web/scripts/gen_stringStructures_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/stringStructures.json. CI regenerates the
file and fails if it changed, which means the implementations drifted.
"""

import importlib.util
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STRING = ROOT / "Data_Structures" / "Linear" / "String"
OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "stringStructures.json"


def load(name, path):
    """Import a module by path (main.py is a generic name, so give each a unique one)."""
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


basics = load("string_basics_main", STRING / "String_Basics" / "Python" / "main.py")
manip = load("string_manipulation", STRING / "String_Manipulation" / "Python" / "string_manipulation.py")
rope = load("rope", STRING / "Rope" / "Python" / "rope.py")

# Printable ASCII only: the visualizations accept nothing else (see parseStringScript).
ALPHABET = "ab -,AEi!"


def call(fn, args):
    """One case: the function name, its arguments and what it returns or raises."""
    case = {"fn": fn, "args": list(args)}
    try:
        case["result"] = getattr(basics if hasattr(basics, fn) else manip, fn)(*args)
    except Exception as e:  # noqa: BLE001 - the exception type is what we record
        case["error"] = type(e).__name__
    return case


def random_text(rng, lo, hi, alphabet=ALPHABET):
    return "".join(rng.choice(alphabet) for _ in range(rng.randint(lo, hi)))


def basics_cases(rng):
    cases = []
    for s in ["", "a", "hello", "Hello, World!"]:
        n = len(s)
        for i in range(-n - 2, n + 2):
            cases.append(call("access_char", (s, i)))
        cases.append(call("string_length", (s,)))
        cases.append(call("traverse_string", (s,)))
    for a, b in [("abc", "def"), ("", ""), ("hello", ""), ("", "world"), ("Hello", ", World!")]:
        cases.append(call("concatenate", (a, b)))
    for s in ["hello", "ab", ""]:
        n = len(s)
        for start in range(-n - 3, n + 4):
            for end in range(-n - 3, n + 4):
                cases.append(call("substring", (s, start, end)))
    cases.append(call("substring", ("abcdef", -3, 6)))
    cases.append(call("substring", ("abcdef", 3, 1)))
    cases.append(call("substring", ("abc", 0, 99)))
    for _ in range(60):
        s = random_text(rng, 0, 12)
        cases.append(call("access_char", (s, rng.randint(-15, 15))))
        cases.append(call("substring", (s, rng.randint(-15, 15), rng.randint(-15, 15))))
        cases.append(call("concatenate", (s, random_text(rng, 0, 6))))
    return cases


def manipulation_cases(rng):
    cases = []
    tricky = ["", "a", "Aa", "level", "racecar", "abca", "abba", "hello", "Hello World 123", "A man, a plan"]
    for s in tricky:
        for fn in ("reverse_string", "is_palindrome", "count_vowels", "to_upper", "to_lower"):
            cases.append(call(fn, (s,)))
    for args in [
        ("hello", "l", "x"),
        ("hello", "ll", "L"),
        ("hello", "z", "y"),
        ("aaa", "aa", "b"),
        ("abab", "ab", "ba"),
        ("abc", "", "-"),
        ("", "", "-"),
        ("", "a", "b"),
        ("a b c", " ", ""),
        ("Mississippi", "ss", "SS"),
    ]:
        cases.append(call("replace_char", args))
    for args in [
        ("a b c", " "),
        ("a b ", " "),
        ("a  b", " "),
        ("", " "),
        (" ", " "),
        ("a,b", ","),
        ("abc", ","),
        ("abc", ""),
        ("a--b---c", "--"),
        (",a,", ","),
    ]:
        cases.append(call("split_string", args))
    for args in [
        ([], "-"),
        (["x"], "-"),
        (["a", "b", ""], " "),
        (["", ""], ","),
        (["ab", "cd", "ef"], ", "),
        (["a", "b"], ""),
    ]:
        cases.append(call("join_string", args))
    for _ in range(60):
        s = random_text(rng, 0, 12)
        for fn in ("reverse_string", "is_palindrome", "count_vowels", "to_upper", "to_lower"):
            cases.append(call(fn, (s,)))
        cases.append(call("replace_char", (s, random_text(rng, 0, 2, "ab "), random_text(rng, 0, 2, "XY"))))
        sep = random_text(rng, 0, 2, "a ,")
        cases.append(call("split_string", (s, sep)))
        parts = [random_text(rng, 0, 3) for _ in range(rng.randint(0, 4))]
        cases.append(call("join_string", (parts, random_text(rng, 0, 2, "-, "))))
    return cases


def shape(node):
    """A leaf is its fragment, an internal node the pair of its children's shapes."""
    if node is None:
        return None
    if node.data is not None:
        return node.data
    return [shape(node.left), shape(node.right)]


def run_script(text, ops):
    """Run an edit script on Rope(text); record the whole tree after every operation."""
    r = rope.Rope(text)
    steps = []
    for op in ops:
        kind = op[0]
        result = None
        if kind == "index":
            try:
                result = r.index(op[1])
            except IndexError:
                result = {"error": "IndexError"}
        elif kind == "split":
            left, right = r.split(op[1])
            result = [shape(left._root), shape(right._root)]
        elif kind == "insert":
            r.insert(op[1], op[2])
        elif kind == "delete":
            r.delete(op[1], op[2])
        elif kind == "concat":
            r = r.concat(rope.Rope(op[1]))
        steps.append({"text": r.to_string(), "len": len(r), "height": r.height(), "shape": shape(r._root), "result": result})
    return {"text": text, "ops": [list(op) for op in ops], "steps": steps}


# The visualization's examples (web/src/viz/specs/rope.tsx), with "end" resolved to a number.
ROPE_EXAMPLES = [
    ("Hello World!", [("insert", 5, ","), ("index", 6), ("delete", 5, 2)]),
    ("Hello, World! Nice to meet you!", [("index", 20), ("index", 0), ("index", 30), ("index", 31), ("index", -1)]),
    ("Hello, World! Nice to meet you!", [("insert", 31, "!"), ("insert", 32, "?"), ("insert", 33, "#")]),
    ("[]", [("insert", 1, "hello world")]),
    ("Hello, World! Nice to meet you!", [("split", 7), ("split", 20), ("concat", " Bye!")]),
    ("abcdefghijklmnopqrstuvwxyz", [("delete", 8, 10), ("insert", 0, "0123"), ("split", 0), ("index", 3)]),
    ("", [("index", 0), ("insert", 0, "abc"), ("concat", ""), ("split", 9)]),
]


def random_rope_scripts(rng, count):
    scripts = []
    for _ in range(count):
        text = random_text(rng, 0, 30, "abcdefgh ")
        length = len(text)
        ops = []
        for _ in range(rng.randint(1, 8)):
            kind = rng.choice(["index", "split", "insert", "insert", "delete", "concat"])
            pos = rng.randint(-3, length + 3)
            if kind == "index" or kind == "split":
                ops.append((kind, pos))
            elif kind == "insert":
                add = random_text(rng, 0, 14, "XYZ")
                ops.append((kind, pos, add))
                length += len(add)
            elif kind == "delete":
                n = rng.randint(0, 9)
                ops.append((kind, pos, n))
                p = min(max(pos, 0), length)
                length -= min(n, length - p)
            else:
                add = random_text(rng, 0, 20, "XYZ")
                ops.append((kind, add))
                length += len(add)
        scripts.append(run_script(text, ops))
    return scripts


def main():
    rng = random.Random(20261113)
    sections = {
        "basics": basics_cases(rng),
        "manipulation": manipulation_cases(rng),
        "rope": [run_script(text, ops) for text, ops in ROPE_EXAMPLES] + random_rope_scripts(rng, 150),
    }
    header = {
        "generator": "web/scripts/gen_stringStructures_fixtures.py",
        "reference": "Data_Structures/Linear/String (String_Basics/Python/main.py, String_Manipulation/Python/string_manipulation.py, Rope/Python/rope.py)",
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

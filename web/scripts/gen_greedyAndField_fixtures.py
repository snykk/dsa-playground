"""Generate golden fixtures for Huffman coding, job scheduling and GF(2^8) from the repository's Python code.

The web visualizer re-implements three topics in TypeScript:

- web/src/viz/algorithms/huffmanCoding.ts ports build_huffman_tree, build_codes, huffman_encode and
  calculate_compression_ratio (Algorithms/Greedy/Huffman_Coding/Python/huffman_coding.py), including
  the exact moves of Python's heapq on HuffmanNode objects that compare by frequency only;
- web/src/viz/algorithms/jobScheduling.ts ports the three rules of
  Algorithms/Greedy/Job_Scheduling/Python/job_scheduling.py;
- web/src/viz/algorithms/galoisField.ts ports GF256 and _slow_multiply of
  Algorithms/Coding_Theory/Galois_Field/Python/galois_field.py.

These fixtures pin each port to its reference:

- huffman: every heappush / heappop the real code makes (wrapped so the heap is recorded after each
  call; nodes are numbered in the order they are first pushed), which pins every tie heapq breaks,
  then the code table in dict order, the encoded bits, the ratio and the savings;
- deadline / edf / smith: the return value of each rule (ZeroDivisionError for a processing time
  of 0 in Smith's rule), with many tied profits, deadlines and ratios;
- field: the exp and log tables, _slow_multiply on random pairs and the result (or the exception)
  of every add / sub / mul / div / inv / pow of random scripts.

Run from anywhere:

    python3 web/scripts/gen_greedyAndField_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/greedyAndField.json. CI regenerates the file and
fails if it changed, which means the two implementations drifted.
"""

import heapq
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
for folder in (
    ROOT / "Algorithms" / "Greedy" / "Huffman_Coding" / "Python",
    ROOT / "Algorithms" / "Greedy" / "Job_Scheduling" / "Python",
    ROOT / "Algorithms" / "Coding_Theory" / "Galois_Field" / "Python",
):
    sys.path.insert(0, str(folder))

import huffman_coding  # noqa: E402
from galois_field import GF, _slow_multiply  # noqa: E402
from job_scheduling import (  # noqa: E402
    job_scheduling_deadline,
    job_scheduling_earliest_deadline,
    job_scheduling_weighted_completion_time,
)

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "greedyAndField.json"


# ---------- Huffman coding ----------


class RecordingHeapq:
    """Stands in for the heapq module inside huffman_coding: calls the real heapq, then records
    the heap. A node's number is the order in which it was first pushed (the leaves in Counter
    order, then each merged node)."""

    def __init__(self):
        self.number = {}
        self.keep = []
        self.log = []

    def heappush(self, heap, item):
        if id(item) not in self.number:
            self.number[id(item)] = len(self.keep)
            self.keep.append(item)
        heapq.heappush(heap, item)
        self.log.append(["push", self.number[id(item)], [self.number[id(n)] for n in heap]])

    def heappop(self, heap):
        item = heapq.heappop(heap)
        self.log.append(["pop", self.number[id(item)], [self.number[id(n)] for n in heap]])
        return item


def huffman_case(text):
    shim = RecordingHeapq()
    huffman_coding.heapq = shim
    try:
        encoded, codes, tree = huffman_coding.huffman_encode(text)
    finally:
        huffman_coding.heapq = heapq
    ratio, savings = huffman_coding.calculate_compression_ratio(text, encoded, codes)
    assert huffman_coding.huffman_decode(encoded, tree) == text
    return {
        "text": text,
        "log": shim.log,
        "codes": [[c, code] for c, code in codes.items()],
        "encoded": encoded,
        "ratio": ratio,
        "savings": savings,
    }


HUFFMAN_FIXED = [
    "",
    "a",
    "aaaa",
    "ab",
    "hello",
    "abracadabra",
    "mississippi",
    "aaaaabbbcc",
    "abcdef",
    "abcdefgh" * 3,
    "aabbccdd",
    "to be or not to be",
    "a" * 45 + "b" * 13 + "c" * 12 + "d" * 16 + "e" * 9 + "f" * 5,
    "abbcccddddeeeee",
    "aabbbbcccccccc",
    "ABRACADABRA, said the cat!",
]


def huffman_cases(rng, count):
    cases = [huffman_case(t) for t in HUFFMAN_FIXED]
    alphabet = "abcdefghijklmnop .,!AB01"
    while len(cases) < count:
        k = rng.randint(1, 12)
        symbols = rng.sample(alphabet, k)
        n = rng.randint(1, 64)
        # Few distinct weights, so equal frequencies (and heapq's tie-breaking) are common.
        weights = [rng.choice([1, 1, 2, 3]) for _ in symbols]
        text = "".join(rng.choices(symbols, weights=weights, k=n))
        cases.append(huffman_case(text))
    return cases


# ---------- job scheduling ----------


def job_id(rng, i):
    roll = rng.random()
    if roll < 0.15:
        return -1 - i
    if roll < 0.3:
        return "J" + str(i + 1)
    return i + 1


def deadline_cases(rng, count):
    fixed = [
        [(1, 2, 100), (2, 1, 19), (3, 2, 27), (4, 1, 25), (5, 3, 15)],
        [(1, 0, 50), (2, 1, 5)],
        [(-1, 1, 100), (2, 1, 50)],
        [(-1, 2, 100), (2, 1, 50), (3, 2, 40)],
        [(1, 1, 10), (2, 1, 10), (3, 1, 10)],
        [(1, -2, 30), (2, 0, 20)],
        [(1, 3, -5), (2, 1, 7)],
    ]
    cases = []
    for jobs in fixed:
        profit, scheduled = job_scheduling_deadline(list(jobs))
        cases.append({"jobs": [list(j) for j in jobs], "profit": profit, "scheduled": scheduled})
    while len(cases) < count:
        n = rng.randint(1, 12)
        jobs = [(job_id(rng, i), rng.randint(-2, 8), rng.choice([rng.randint(-5, 60), rng.randint(1, 4) * 10])) for i in range(n)]
        profit, scheduled = job_scheduling_deadline(list(jobs))
        cases.append({"jobs": [list(j) for j in jobs], "profit": profit, "scheduled": scheduled})
    return cases


def edf_cases(rng, count):
    cases = [{"jobs": [[1, 4, 5], [2, 2, 3], [3, 6, 4]], "order": job_scheduling_earliest_deadline([(1, 4, 5), (2, 2, 3), (3, 6, 4)])}]
    while len(cases) < count:
        n = rng.randint(1, 10)
        jobs = [(job_id(rng, i), rng.randint(-3, 12), rng.randint(0, 9)) for i in range(n)]
        cases.append({"jobs": [list(j) for j in jobs], "order": job_scheduling_earliest_deadline(list(jobs))})
    return cases


def smith_case(jobs):
    try:
        order, total = job_scheduling_weighted_completion_time(list(jobs))
        return {"jobs": [list(j) for j in jobs], "order": order, "total": total}
    except ZeroDivisionError:
        return {"jobs": [list(j) for j in jobs], "error": "ZeroDivisionError"}


def smith_cases(rng, count):
    fixed = [
        [(1, 3, 10), (2, 1, 20), (3, 2, 15)],
        [("J1", 3, 1), ("J2", 1, 2), ("J3", 2, 3)],
        [(1, 2, 4), (2, 1, 2), (3, 4, 8)],
        [(1, 2, 3), (2, 0, 5)],
    ]
    cases = [smith_case(j) for j in fixed]
    while len(cases) < count:
        n = rng.randint(1, 10)
        jobs = [(job_id(rng, i), rng.choice([rng.randint(1, 6), rng.randint(1, 6), 0 if rng.random() < 0.1 else 2]), rng.randint(0, 9)) for i in range(n)]
        cases.append(smith_case(jobs))
    return cases


# ---------- GF(2^8) ----------


def field_op(name, args):
    try:
        if name == "add":
            return GF.add(*args)
        if name == "sub":
            return GF.sub(*args)
        if name == "mul":
            return GF.mul(*args)
        if name == "div":
            return GF.div(*args)
        if name == "inv":
            return GF.inv(*args)
        return GF.pow(*args)
    except (ZeroDivisionError, ValueError) as exc:
        return type(exc).__name__


def field_section(rng):
    pairs = [[0x53, 0xCA], [0, 7], [7, 0], [1, 255], [255, 255], [2, 0x80], [3, 3]]
    while len(pairs) < 300:
        pairs.append([rng.randint(0, 255), rng.randint(0, 255)])
    slow = [[a, b, _slow_multiply(a, b)] for a, b in pairs]
    fixed = [
        ["mul", 0x53, 0xCA], ["add", 0x53, 0xCA], ["inv", 0x53], ["inv", 0xCA], ["div", 1, 0x53],
        ["div", 1, 0], ["div", 0, 9], ["inv", 0], ["inv", 1], ["pow", 0, 0], ["pow", 0, -3],
        ["pow", 0x53, 4], ["pow", 3, 255], ["pow", 3, -1], ["pow", 2, 51], ["mul", 0xFF, 0xFF],
        ["sub", 5, 3], ["mul", 2, 0x80],
    ]
    ops = [[name] + args + [field_op(name, args)] for name, *args in fixed]
    names = ["add", "sub", "mul", "div", "inv", "pow"]
    while len(ops) < 400:
        name = rng.choice(names)
        byte = lambda: rng.choice([0, 1, rng.randint(0, 255), rng.randint(0, 255)])  # noqa: E731
        args = [byte()] if name == "inv" else [byte(), rng.randint(-600, 600)] if name == "pow" else [byte(), byte()]
        ops.append([name] + args + [field_op(name, args)])
    return {"exp": list(GF.exp_table), "log": list(GF.log_table), "slow": slow, "ops": ops}


def main():
    rng = random.Random(20261115)
    sections = {
        "huffman": huffman_cases(rng, 140),
        "deadline": deadline_cases(rng, 150),
        "edf": edf_cases(rng, 80),
        "smith": smith_cases(rng, 100),
    }
    field = field_section(rng)
    header = {
        "generator": "web/scripts/gen_greedyAndField_fixtures.py",
        "reference": "Algorithms/Greedy (huffman_coding.py, job_scheduling.py) and Algorithms/Coding_Theory/Galois_Field (galois_field.py)",
    }
    parts = []
    for key, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(key) + ": [\n" + ",\n".join(lines) + "\n]")
    field_lines = [json.dumps(k) + ":" + json.dumps(v, separators=(",", ":")) for k, v in field.items()]
    parts.append('"field": {\n' + ",\n".join(field_lines) + "\n}")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    counts = ", ".join(f"{len(c)} {k}" for k, c in sections.items())
    print(f"wrote {counts} cases and the field tables to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

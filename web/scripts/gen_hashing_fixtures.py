"""Generate golden hashing fixtures from the repository's Python implementations.

The web visualizer re-implements the hashing topics in TypeScript: separate chaining
(web/src/viz/algorithms/hashTable.ts: HashTable, HashSet, HashTableChaining), linear and
quadratic probing (openAddressing.ts), the Bloom filter with its own MD5 (bloomFilter.ts,
md5.ts) and the LRU / LFU caches (cache.ts). These fixtures pin each port to its reference
in Data_Structures/Hashing and Data_Structures/Advanced_Structures:

- chaining: the result of every operation and the bucket contents after it, so the hash
  (int % capacity, the 31-polynomial for str), the resize rule and the re-put order count;
- probing: every slot _probe read, the result, and the slots (tombstones included);
- Bloom filter: MD5 digests, m and k for many sizes, the bit positions of every item and
  the bits set after every operation;
- caches: get results, the evicted key, the LRU list and dict order, the LFU buckets,
  key_to_val and min_freq after every operation.

Run from anywhere:

    python3 web/scripts/gen_hashing_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/hashing.json. CI regenerates the file and
fails if it changed, which means the two implementations drifted.
"""

import hashlib
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DS = ROOT / "Data_Structures"
for folder in (
    "Hashing/Hash_Table/Python",
    "Hashing/Hash_Set/Python",
    "Hashing/Collision_Handling/Python",
    "Hashing/Bloom_Filter/Python",
    "Advanced_Structures/LRU_Cache/Python",
    "Advanced_Structures/LFU_Cache/Python",
):
    sys.path.insert(0, str(DS / folder))

from bloom_filter import BloomFilter  # noqa: E402
from collision_handling import HashTableChaining, HashTableOpenAddressing, HashTableQuadraticProbing  # noqa: E402
from hash_set import HashSet  # noqa: E402
from hash_table import HashTable  # noqa: E402
from lfu_cache import LFUCache  # noqa: E402
from lru_cache import LRUCache  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "hashing.json"
RNG = random.Random(20261113)
WORDS = ["cat", "dog", "owl", "ant", "bee", "fox", "emu", "yak", "abcd", "cdab", "pots", "tops", "5", "17", "ab", "ba"]


def random_key(pool):
    return RNG.choice(pool)


def key_pool(capacity, words=True):
    """Keys that collide often: multiples of the capacity, small ints, negatives and words."""
    pool = [RNG.randint(-20, 40) for _ in range(6)] + [capacity * RNG.randint(0, 5) + RNG.randint(0, 1) for _ in range(4)]
    if words:
        pool += RNG.sample(WORDS, 4)
    return pool


def value():
    return RNG.choice([RNG.randint(-5, 99), RNG.choice(["a", "b", "x", "B", "zz"])])


# ---------- separate chaining ----------


def chain_dump(buckets, pairs=True):
    if pairs:
        return [[[k, v] for k, v in bucket] for bucket in buckets]
    return [list(bucket) for bucket in buckets]


def table_case(capacity, ops):
    table = HashTable(capacity)
    steps = []
    for op in ops:
        kind, key = op[0], op[1]
        if kind == "put":
            result = table.put(key, op[2])
        elif kind == "get":
            result = table.get(key)
        elif kind == "remove":
            result = table.remove(key)
        else:
            result = table.contains(key)
        steps.append({"result": result, "capacity": table.capacity, "size": table.size, "buckets": chain_dump(table.buckets)})
    return {"capacity": capacity, "ops": ops, "steps": steps}


def set_case(capacity, ops):
    hs = HashSet(capacity)
    steps = []
    for kind, key in ops:
        result = hs.add(key) if kind == "add" else hs.remove(key) if kind == "remove" else hs.contains(key)
        steps.append({"result": result, "capacity": hs.capacity, "size": hs.size, "buckets": chain_dump(hs.buckets, pairs=False)})
    return {"capacity": capacity, "ops": ops, "steps": steps}


def chaining_case(capacity, ops):
    table = HashTableChaining(capacity)
    steps = []
    for op in ops:
        kind, key = op[0], op[1]
        result = table.put(key, op[2]) if kind == "put" else table.get(key) if kind == "get" else table.remove(key)
        steps.append({"result": result, "size": table.size, "buckets": chain_dump(table.buckets)})
    return {"capacity": capacity, "ops": ops, "steps": steps}


def random_map_ops(capacity, kinds, words=True, live_cap=12):
    """A script whose live key count stays <= live_cap (the visualizer's limit)."""
    pool = key_pool(capacity, words)
    live = set()
    ops = []
    for _ in range(RNG.randint(3, 14)):
        key = random_key(pool)
        kind = RNG.choice(kinds)
        if kind in ("put", "add") and key not in live and len(live) >= live_cap:
            kind = "remove"
        if kind == "put":
            ops.append(["put", key, value()])
            live.add(key)
        elif kind == "add":
            ops.append(["add", key])
            live.add(key)
        else:
            ops.append([kind, key])
            if kind == "remove":
                live.discard(key)
    return ops


def max_capacity(capacity, ops):
    """The capacity a resizing table reaches on this script (the visualizer allows 16)."""
    live = set()
    for op in ops:
        if op[0] in ("put", "add") and op[1] not in live:
            live.add(op[1])
            if len(live) / capacity > 0.75:
                capacity *= 2
        elif op[0] == "remove":
            live.discard(op[1])
    return capacity


def table_cases(count):
    fixed = [
        (4, [["put", 5, "a"], ["put", 9, "b"], ["put", 13, "c"], ["put", 2, "d"], ["put", 7, "e"], ["get", 13], ["remove", 9]]),
        (8, [["put", "cat", 1], ["put", "dog", 2], ["put", "cat", 3], ["get", "cat"], ["get", "owl"], ["contains", "dog"], ["remove", "dog"]]),
        (8, [["put", k, "abcdefg"[i]] for i, k in enumerate((0, 8, 16, 24, 32, 40))] + [["get", 40], ["put", 48, "g"]]),
        (4, [["put", -1, "a"], ["put", -5, "b"], ["put", 3, "c"], ["get", -5], ["remove", -1], ["get", 3]]),
        (8, [["put", 1, "a"], ["put", 9, "b"], ["put", 17, "c"], ["put", 25, "d"], ["remove", 9], ["get", 25], ["get", 9]]),
        (1, [["put", 1, 1], ["put", 2, 2], ["put", 3, 3], ["put", 4, 4], ["put", 5, 5], ["contains", 5]]),
        (16, [["put", "5", "s"], ["put", 5, "i"], ["get", "5"], ["get", 5], ["remove", "5"], ["contains", 5]]),
        (3, [["put", k, k] for k in range(9)]),
    ]
    cases = [table_case(c, ops) for c, ops in fixed]
    while len(cases) < count:
        capacity = RNG.choice([1, 2, 3, 4, 4, 8, 8, 16])
        ops = random_map_ops(capacity, ["put", "put", "get", "remove", "contains"])
        if max_capacity(capacity, ops) <= 16:
            cases.append(table_case(capacity, ops))
    return cases


def set_cases(count):
    fixed = [
        (4, [["add", 10], ["add", 14], ["add", 18], ["add", 3], ["add", 7], ["add", 14], ["remove", 18]]),
        (8, [["add", "cat"], ["add", "dog"], ["add", "cat"], ["contains", "owl"], ["contains", "dog"], ["remove", "owl"]]),
        (16, [["add", 0], ["add", 16], ["add", 32], ["add", 48], ["contains", 48], ["remove", 16], ["contains", 16]]),
        (2, [["add", k] for k in range(1, 8)]),
    ]
    cases = [set_case(c, ops) for c, ops in fixed]
    while len(cases) < count:
        capacity = RNG.choice([1, 2, 3, 4, 4, 8, 16])
        ops = random_map_ops(capacity, ["add", "add", "remove", "contains"])
        if max_capacity(capacity, ops) <= 16:
            cases.append(set_case(capacity, ops))
    return cases


COLLISION_FIXED = [
    (8, [["put", 3, "a"], ["put", 11, "b"], ["put", 19, "c"], ["put", 6, "d"], ["put", 14, "e"], ["get", 19]]),
    (8, [["put", 3, "a"], ["put", 11, "b"], ["put", 19, "c"], ["remove", 11], ["get", 19], ["put", 27, "d"]]),
    (8, [["put", 1, "a"], ["put", 17, "b"], ["remove", 1], ["put", 17, "B"], ["get", 17], ["remove", 17], ["get", 17]]),
    (4, [["put", 3, "a"], ["put", 7, "b"], ["put", 11, "c"], ["put", 15, "d"], ["put", 19, "e"], ["remove", 7], ["put", 19, "e"], ["get", 19]]),
    (8, [["put", 0, "a"], ["put", 8, "b"], ["put", 16, "c"], ["put", 24, "d"], ["put", 32, "e"], ["get", 32]]),
    (6, [["put", 0, "a"], ["put", 6, "b"], ["put", 12, "c"], ["put", 18, "d"], ["put", 24, "e"], ["get", 24]]),
    (16, [["put", "cat", 1], ["put", "dog", 2], ["put", "abcd", 3], ["put", "cdab", 4], ["remove", "abcd"], ["get", "cdab"]]),
]


def chaining_cases(count):
    cases = [chaining_case(c, ops) for c, ops in COLLISION_FIXED]
    while len(cases) < count:
        capacity = RNG.choice([1, 2, 4, 5, 8, 16])
        cases.append(chaining_case(capacity, random_map_ops(capacity, ["put", "put", "get", "remove"])))
    return cases


# ---------- open addressing ----------


def probe_recorder(table):
    """Record every slot _probe reads; put / get / remove behave exactly as before."""
    log = []

    class Recording(list):
        def __getitem__(self, index):
            log.append(index)
            return list.__getitem__(self, index)

    table.buckets = Recording(table.buckets)
    original = table._probe
    last = {}

    def probe(key):
        del log[:]
        try:
            return original(key)
        finally:
            last["probes"] = list(log)

    table._probe = probe
    return last


def slot_dump(table):
    out = []
    for slot in list.__iter__(table.buckets):
        if slot is None:
            out.append(None)
        elif slot is table.DELETED:
            out.append("DEL")
        else:
            out.append([slot[0], slot[1]])
    return out


def open_case(cls, capacity, ops):
    table = cls(capacity)
    last = probe_recorder(table)
    steps = []
    for op in ops:
        kind, key = op[0], op[1]
        try:
            result = table.put(key, op[2]) if kind == "put" else table.get(key) if kind == "get" else table.remove(key)
        except Exception as e:  # put of a new key into a full table
            if str(e) != "Hash table is full":
                raise
            result = "full"
        steps.append({"result": result, "size": table.size, "slots": slot_dump(table), "probes": last["probes"]})
    return {"capacity": capacity, "ops": ops, "steps": steps}


def open_cases(cls, count):
    cases = [open_case(cls, c, ops) for c, ops in COLLISION_FIXED]
    while len(cases) < count:
        capacity = RNG.choice([1, 2, 3, 4, 5, 6, 8, 8, 16])
        cases.append(open_case(cls, capacity, random_map_ops(capacity, ["put", "put", "put", "get", "remove", "remove"])))
    return cases


# ---------- Bloom filter ----------


def md5_cases():
    texts = ["", "a", "abc", "message digest", "abcdefghijklmnopqrstuvwxyz", "cat0", "dog2", "never0"]
    texts += ["x" * n for n in (55, 56, 57, 63, 64, 65, 119, 120, 128)]
    texts += ["".join(RNG.choice("abcdefghij0123456789-_") for _ in range(RNG.randint(1, 80))) for _ in range(20)]
    return [[t, hashlib.md5(t.encode("utf-8")).hexdigest()] for t in texts]


def size_cases():
    rates = [0.5, 0.4, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05, 0.02, 0.01, 0.005, 0.001, 0.9, 0.99, 0.75, 0.333]
    out = []
    for capacity in list(range(1, 21)) + [25, 50, 99, 100, 1000]:
        for rate in rates:
            bf = BloomFilter(capacity, rate)
            out.append([capacity, rate, bf.num_bits, bf.num_hashes])
    return out


BLOOM_WORDS = ["cat", "dog", "owl", "aoo", "fox", "bee", "ant", "emu", "yak", "elk", "hen", "cow", "pig", "rat", "bat", "eel", "koi", "apple", "pear", "plum", "a", "b", "never", "1", "x-y_z"]


def bloom_case(capacity, rate, ops):
    bf = BloomFilter(capacity, rate)
    steps = []
    for kind, item in ops:
        positions = bf._hash_functions(item)
        if kind == "add":
            result = bf.add(item)
        else:
            result = bf.contains(item)
        steps.append({"result": result, "positions": positions, "set": [i for i, b in enumerate(bf.bits) if b]})
    return {"capacity": capacity, "error_rate": rate, "m": bf.num_bits, "k": bf.num_hashes, "ops": ops, "steps": steps}


def bloom_cases(count):
    fixed = [
        (5, 0.1, [["add", "cat"], ["add", "dog"], ["contains", "cat"], ["contains", "owl"], ["contains", "aoo"]]),
        (5, 0.1, [["add", "bee"], ["add", "ant"], ["contains", "bee"], ["contains", "fox"]]),
        (3, 0.1, [["add", w] for w in ("cat", "dog", "owl", "fox", "bee", "ant")] + [["contains", w] for w in ("emu", "pig", "bat", "koi")]),
        (2, 0.5, [["add", "a"], ["contains", "b"], ["contains", "never"]]),
        (5, 0.01, [["add", "apple"], ["add", "pear"], ["contains", "plum"], ["contains", "apple"]]),
    ]
    cases = [bloom_case(c, r, ops) for c, r, ops in fixed]
    while len(cases) < count:
        capacity = RNG.randint(1, 12)
        rate = RNG.choice([0.5, 0.3, 0.2, 0.1, 0.05])
        if BloomFilter(capacity, rate).num_bits > 64:
            continue
        ops = [[RNG.choice(["add", "add", "contains"]), RNG.choice(BLOOM_WORDS)] for _ in range(RNG.randint(1, 12))]
        cases.append(bloom_case(capacity, rate, ops))
    return cases


# ---------- caches ----------


def lru_order(cache):
    out = []
    node = cache._head.next
    while node is not cache._tail:
        out.append([node.key, node.value])
        node = node.next
    return out


def cache_ops(keys, count):
    return [["put", RNG.randint(1, keys), RNG.randint(0, 99)] if RNG.random() < 0.55 else ["get", RNG.randint(1, keys)] for _ in range(count)]


CACHE_FIXED = [
    (2, [["put", 1, 1], ["put", 2, 2], ["get", 1], ["put", 3, 3], ["get", 2], ["put", 4, 4], ["get", 1], ["get", 3], ["get", 4]]),
    (2, [["put", 1, 1], ["put", 2, 2], ["get", 1], ["put", 3, 3], ["get", 2], ["get", 3], ["put", 4, 4], ["get", 1], ["get", 3], ["get", 4]]),
    (3, [["put", 1, 10], ["put", 2, 20], ["put", 3, 30], ["get", 1], ["put", 4, 40], ["get", 2], ["get", 3]]),
    (2, [["put", 1, 10], ["put", 2, 20], ["put", 1, 15], ["put", 3, 30], ["get", 2], ["get", 1]]),
    (2, [["put", 1, 1], ["put", 2, 2], ["get", 1], ["put", 3, 3], ["get", 1], ["get", 2], ["get", 3], ["put", 4, 4], ["get", 1], ["get", 3], ["get", 4]]),
    (2, [["put", 1, 10], ["put", 2, 20], ["put", 3, 30], ["get", 1], ["get", 2], ["get", 3]]),
    (3, [["put", 1, 10], ["get", 1], ["get", 1], ["put", 2, 20], ["put", 3, 30], ["put", 4, 40], ["put", 5, 50], ["get", 1]]),
    (1, [["put", 1, 10], ["get", 1], ["get", 1], ["put", 2, 20], ["get", 1], ["get", 2]]),
    (0, [["put", 1, 10], ["get", 1]]),
]


def lru_case(capacity, ops):
    cache = LRUCache(capacity)
    steps = []
    for op in ops:
        before = set(cache.cache)
        if op[0] == "put":
            result = cache.put(op[1], op[2])
            after = set(cache.cache)
            gone = (before - after) or ({op[1]} if op[1] not in before and op[1] not in after else set())
            evicted = gone.pop() if gone else None
        else:
            result = cache.get(op[1])
            evicted = None
        steps.append({"result": result, "order": lru_order(cache), "dict": list(cache.cache.keys()), "evicted": evicted})
    return {"capacity": capacity, "ops": ops, "steps": steps}


def lfu_case(capacity, ops):
    cache = LFUCache(capacity)
    steps = []
    for op in ops:
        before = set(cache.key_to_val)
        if op[0] == "put":
            result = cache.put(op[1], op[2])
            gone = before - set(cache.key_to_val)
            evicted = gone.pop() if gone else None
        else:
            result = cache.get(op[1])
            evicted = None
        steps.append(
            {
                "result": result,
                "buckets": [[f, [[k, v] for k, v in bucket.items()]] for f, bucket in sorted(cache.freq_to_keys.items())],
                "keyToVal": [[k, v, f] for k, (v, f) in cache.key_to_val.items()],
                "minFreq": cache.min_freq,
                "size": cache.size,
                "evicted": evicted,
            }
        )
    return {"capacity": capacity, "ops": ops, "steps": steps}


def cache_cases(make, count):
    cases = [make(c, ops) for c, ops in CACHE_FIXED]
    while len(cases) < count:
        capacity = RNG.randint(0, 6)
        cases.append(make(capacity, cache_ops(capacity + 2, RNG.randint(1, 18))))
    return cases


def main():
    sections = {
        "md5": md5_cases(),
        "bloomSize": size_cases(),
        "bloom": bloom_cases(40),
        "hashTable": table_cases(60),
        "hashSet": set_cases(40),
        "chaining": chaining_cases(40),
        "linear": open_cases(HashTableOpenAddressing, 60),
        "quadratic": open_cases(HashTableQuadraticProbing, 60),
        "lru": cache_cases(lru_case, 50),
        "lfu": cache_cases(lfu_case, 60),
    }
    header = {
        "generator": "web/scripts/gen_hashing_fixtures.py",
        "reference": "Data_Structures/Hashing (hash_table.py, hash_set.py, collision_handling.py, bloom_filter.py); Data_Structures/Advanced_Structures (lru_cache.py, lfu_cache.py)",
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

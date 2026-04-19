# Randomized Algorithms

Algorithms that use randomness as part of their logic, not just tie-breaking. They trade a deterministic worst case for simpler code, better expected complexity, or the ability to solve problems that have no deterministic solution.

---

## 🎯 Why Randomness Helps

Three recurring themes:

1. **Simpler implementation** — a random pivot makes Quick Sort O(n log n) expected _without_ the complexity of median-of-medians.
2. **No adversary** — the adversary can't pick inputs to trigger worst-case if our algorithm's behavior depends on our own coin flips.
3. **Streaming & online** — when data arrives once and is then gone, randomness lets us make decisions with limited memory (Reservoir Sampling).

---

## 📂 Algorithms in This Folder

| Algorithm | Purpose | Complexity | Where to find |
|-----------|---------|-----------|---------------|
| **[Reservoir Sampling](Reservoir_Sampling/)** | Uniformly sample `k` items from a stream of unknown length | O(n) time, O(k) space | Any stream / online problem |
| **[Randomized Quickselect](Randomized_Quickselect/)** | Find the k-th smallest element | O(n) expected, O(n²) worst | `std::nth_element`, order statistics |

---

## ⚔️ Randomized vs Deterministic

| Property | Deterministic | Randomized |
|----------|---------------|------------|
| Worst case | Known upper bound | Usually O(n²) or similar bad case |
| Expected / average | Often matches worst | Often much better |
| Adversarial input | Vulnerable | Robust (adversary can't see coin flips) |
| Implementation | Often complex | Usually simple |

Real-world example: the median-of-medians algorithm (deterministic O(n)) is so intricate that most "quickselect" implementations in production libraries use the randomized version — faster in practice and ~10× less code.

---

## ⚠️ When NOT to Randomize

- **Real-time / safety-critical**: a 1-in-10⁹ worst case is fine for you; not fine for an avionics controller.
- **Cryptographic contexts**: use `secrets` (Python), `crypto/rand` (Go), or `<random>` + `std::random_device` (C++). `rand()` or non-seeded `math/rand` is **predictable** and exploitable.
- **Reproducibility**: set a fixed seed for debugging / testing so runs are deterministic.

---

## 🔗 Related

- [Treap](../../Data%20Structures/Non_Linear/Trees/Treap/README.md) — randomized self-balancing BST (expected O(log n))
- [Quick Sort](../Sorting/Quick%20Sort/README.md) — randomized pivot gives O(n log n) expected
- [Bloom Filter](../../Data%20Structures/Hashing/Bloom%20Filter/README.md) — probabilistic membership test

---

_Part of the [Algorithms](../README.md) section._

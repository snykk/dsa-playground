# Collision Handling — C++ Implementation

When two distinct keys hash to the same bucket, we have a **collision**. This folder demonstrates the two mainstream strategies side-by-side in C++:

- **Separate Chaining** — each bucket holds a linked list (or `std::vector`) of colliding entries.
- **Open Addressing** — on collision, probe to another slot within the same array (linear / quadratic / double hashing).

For the conceptual overview, load-factor analysis, and decision tree ("when to pick which"), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `collision_handling.cpp` | Both chaining and open-addressing implementations |
| `collision_handling_test.cpp` | Assertion-based tests covering insert / find / erase |

---

## C++-Specific Notes

- **Chaining**: we use `std::vector<std::list<Entry>>` rather than `std::vector<std::vector<Entry>>`. `std::list` avoids iterator invalidation when entries are inserted mid-chain; if you need better cache behavior, switch to `std::vector` but accept occasional reallocations.
- **Open addressing sentinel**: C++ has no null in `std::string`, so we use an explicit `enum class SlotState { Empty, Occupied, Tombstone }`. **Tombstones are mandatory** — without them, `erase` breaks subsequent probe sequences.
- **Probing strategies**: the implementation shows linear probing (`h + i`) and quadratic probing (`h + i²`). Double hashing (`h1 + i·h2`) gives the best cluster avoidance but needs two independent hash functions.
- **Rehash at load factor ~0.75 (chaining)** or **~0.5 (open addressing)** — open addressing degrades much faster as the table fills because every collision requires a probe walk.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall collision_handling_test.cpp -o collision_handling_test
./collision_handling_test
```

---

## Key Takeaways for Learners

1. **Open addressing needs tombstones for correct deletion.** Forgetting this is the #1 bug in hand-rolled hash tables.
2. **Load factor dictates everything.** Chaining stays useful up to `α ≈ 1` (~O(1) average), while open addressing's expected probes blow up as `1/(1-α)` — doubling at α=0.75 vs α=0.5.
3. **`std::unordered_map` uses chaining** in every major stdlib. It's the safer default. Open addressing wins for small, fixed-size tables and tight cache locality (e.g. symbol tables in compilers, Swiss tables in modern hash map implementations).

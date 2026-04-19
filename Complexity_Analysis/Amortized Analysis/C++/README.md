# Amortized Analysis — C++ Implementation

**Amortized analysis** bounds the _total_ cost of a sequence of operations rather than the worst case of a single operation. `std::vector::push_back` is the canonical example: O(n) when the buffer doubles, but **O(1) amortized** across any sequence of pushes.

For the conceptual overview (aggregate / accounting / potential methods), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `amortized_analysis.cpp` | Demonstrations (dynamic array, binary counter increment) |
| `amortized_analysis_test.cpp` | Assertion tests |

---

## C++-Specific Notes

- **`std::vector` growth factor**: libstdc++ grows by 2×, libc++ and MSVC grow by ~1.5×. Both give amortized O(1) — the constant differs, but asymptotics don't.
- **`reserve()` flattens the amortization**: if you know the final size up front, call `reserve(n)` to allocate once. No growth amortization needed; every `push_back` is literally O(1).
- **Binary counter**: incrementing an n-bit counter from 0 to 2^n costs O(2^n) total — O(1) amortized per increment. Classic accounting-method proof: each `1` bit "prepays" for its eventual flip to `0`.
- **`std::deque` amortizes via block-linked storage** instead of doubling. Different growth strategy, same O(1) amortized guarantee — but worse cache behavior than `std::vector`.
- **Amortization doesn't apply in real-time code**: if the worst-case single operation matters (audio callback, game loop), you need a fixed-capacity container.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall amortized_analysis_test.cpp -o amortized_analysis_test
./amortized_analysis_test
```

---

## Key Takeaways for Learners

1. **Amortized ≠ average-case.** Average-case assumes random input distribution. Amortized is deterministic — it bounds the _total_ cost of any sequence, adversarial or not.
2. **Three proof techniques exist**: aggregate analysis (total / n ops), accounting method (prepaid credits), potential method (invariant-based Φ function). Each has situations where it's cleanest.
3. **`reserve()` is the escape hatch.** When you know the size, use it — you skip the amortization and pay only the one unavoidable allocation.

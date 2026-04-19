# Big-Omega (Ω) Notation — C++ Implementation

**Big-Omega (Ω)** is the asymptotic **lower bound** on an algorithm's running time. Where Big-O says "at worst this fast," Big-Omega says "at best this slow." Critical for proving impossibility results: "_no_ comparison sort can beat Ω(n log n)."

For the conceptual overview and comparison with O / Θ, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `big_omega.cpp` | Concrete examples of Ω analysis |
| `big_omega_test.cpp` | Tests that verify minimum-cost assertions |

---

## C++-Specific Notes

- **Ω is dual to O**: `f = Ω(g) ⟺ g = O(f)`. This duality simplifies many proofs — to show Ω(n log n), it's often easier to show that every algorithm must do at least n log n comparisons.
- **Best-case vs Ω-of-worst-case** are different statements: "Insertion Sort's best case is O(n)" and "Insertion Sort is Ω(n)" both hold, but they mean different things. The former is about _a specific input_; the latter is about _every_ input.
- **Lower bounds drive algorithm choice**: knowing comparison sorts are Ω(n log n) tells you Radix Sort (O(n·k)) can beat them only by avoiding comparisons entirely.
- **`std::sort` hits the Ω(n log n) bound**: introsort achieves Θ(n log n) — matching the lower bound asymptotically.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall big_omega_test.cpp -o big_omega_test
./big_omega_test
```

---

## Key Takeaways for Learners

1. **Ω is about impossibility.** "This problem requires Ω(f(n))" means no algorithm can be asymptotically faster. Lower bounds frame what's achievable at all.
2. **Use the dual definition**: proving `f = Ω(g)` is the same as proving `g = O(f)`. Pick whichever direction makes the math cleaner.
3. **Don't confuse best-case with Ω.** Best-case is about the easiest input. Ω is a lower bound that must hold for _every_ input (or a worst-case-adversary input, depending on context).

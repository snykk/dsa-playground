# Big-Theta (Θ) Notation — Go Implementation

**Big-Theta (Θ)** is the **tight asymptotic bound** — the algorithm is _both_ O(f(n)) and Ω(f(n)). It's the strongest statement you can make about complexity: "this runs in Θ(f(n)) time for every input, no exceptions."

For the conceptual overview and comparison with O / Ω, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Concrete Θ-analysis examples |
| `main_test.go` | Tests asserting the tight bounds |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Merge Sort, Heap Sort** are Θ(n log n) — best, average, and worst cases all agree. Input-independent bounds.
- **Quick Sort is O(n log n) expected, O(n²) worst** — neither Θ. The distinction matters: "Quick Sort is O(n log n) on average" is different from "Quick Sort is Θ(n log n)".
- **`sort.Slice` in Go**: pdqsort (pattern-defeating quicksort) since Go 1.19 is Θ(n log n) worst case — it achieves the tight bound that plain Quick Sort doesn't.
- **Θ is strongest for algorithmic claims.** When writing performance docs, prefer "this is Θ(n)" to "this is O(n)" if the tight bound actually holds — it rules out "maybe it's faster on lucky input."

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Θ is the tight bound.** `f = Θ(g)` ⟺ `f = O(g) ∧ f = Ω(g)`. When both bounds match, you've fully characterized the growth rate.
2. **Not every algorithm has a Θ bound at all** — some have different upper and lower bounds depending on input (Quick Sort, Insertion Sort). Those are O and Ω separately, not Θ.
3. **Use Θ for academic rigor, O in practice.** Papers and formal analysis prefer Θ; engineering writeups say O(n log n) because readers interpret it correctly regardless.

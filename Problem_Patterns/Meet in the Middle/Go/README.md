# Meet in the Middle — Go Implementation

**Meet in the Middle (MITM)** splits a brute-force `O(2^n)` problem into two halves of size `n/2`, solves each half independently, then combines them. The combining step typically uses sorting or hashing to turn `O(2^n)` into `O(2^(n/2) · log(2^(n/2))) = O(2^(n/2) · n)`.

For the conceptual overview and canonical problems (subset sum up to `n = 40`, 4-sum, closest subset sum), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Reference implementations: subset sum, closest subset sum, 4-sum variant |
| `main_test.go` | Table-driven tests |

---

## Go-Specific Notes

- **Subset enumeration**: for `n/2` elements, iterate `for mask := 0; mask < (1 << half); mask++` and build the subset sum. `n = 40` gives `2^20 ≈ 10⁶` subsets per half — totally tractable.
- **`sort.Ints` + `sort.SearchInts` for the combine step**: sort one half, then for each sum in the other half use `SearchInts` to find complements in O(log). Total: O(2^(n/2) · n).
- **`map[int][]int` for multi-valued combines**: if you need to enumerate all pairs whose sums match (not just count), group by sum in a `map[int][]int` — Go maps handle this cleanly.
- **Memory dominates**: MITM trades time for memory. `n = 40` half-sums use ~8 MB in `int64`. Don't even try `n = 50` on a laptop; you're looking at gigabytes.
- **Overflow care**: sums can blow past `int32`. Use `int64` or Go's platform `int` (64-bit on modern systems) consistently.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **MITM is the `2^n → 2^(n/2)` trick.** For `n ≤ 40` where brute-force `2^n` is too slow, MITM is the standard tool. Above `n = 50`, even MITM is too slow — you need DP or pruning.
2. **The combine step is where the cleverness lives.** Sorting + binary search works for "does there exist a pair summing to X?" Hashing works for "count pairs with sum X". Picking the right combine method is the skill.
3. **Memory budget is a real constraint.** Always estimate `2^(n/2) · sizeof(entry)` before writing the code. If it doesn't fit, MITM isn't the answer.

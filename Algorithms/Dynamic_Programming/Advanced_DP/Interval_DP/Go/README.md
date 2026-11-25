# Interval DP -- Go Implementation

Three interval DPs filled by increasing length: merging piles at the minimum cost (with the merges read back, and a top-down form), bursting balloons for the most coins, and cutting a string into palindromes. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | the functions below and a demo `main` |
| `main_test.go` | 9 test functions: the worked example, the three problems against brute force, the merges replayed and their tie rule, the top-down form, edge cases, invalid input, overflow, the exact number of candidates, and 40 + 24 + 24 inputs pinned to the Python outputs |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `MergePiles(piles []int64) (int64, error)`: the minimum total cost of merging neighbouring piles into one; a merge costs the size of the pile it makes.
- `type Merge struct{ I, K, J int }` and `MergePilesPlan(piles []int64) (int64, []Merge, error)`: the cost and the merges, each joining piles `I..K` with piles `K+1..J`, in post-order, the smallest `K` on ties.
- `MergePilesMemo(piles []int64) (int64, error)`: the same cost, computed top-down with a memo.
- `BurstBalloons(nums []int64) (int64, error)`: the most coins from bursting every balloon.
- `MinPalindromeCuts(s string) int`: the fewest cuts that split `s` into palindromes, comparing bytes.

A value below 0 returns an error wrapping `ErrInvalidInput`; an answer that does not fit in an `int64`, one wrapping `ErrOverflow`. Check them with `errors.Is`.

```go
piles := []int64{3, 2, 4, 1}
cost, _ := MergePiles(piles)                   // 20
_, merges, _ := MergePilesPlan(piles)          // [{0 0 1} {2 2 3} {0 1 3}]
memo, _ := MergePilesMemo(piles)               // 20
coins, _ := BurstBalloons([]int64{3, 1, 5, 8}) // 167
cuts := MinPalindromeCuts("aab")               // 1
```

## Go-Specific Notes

- **`int64`, checked.** As in C++, -1 (`tooLarge`) stands for a merge cost above `math.MaxInt64`: such a candidate never wins a minimum, and only the answer's own cell decides whether `ErrOverflow` is returned. A total of the piles that does not fit returns `ErrOverflow` at once; the coins of `BurstBalloons` return it at the first candidate that does not fit.
- **Errors, not panics.** Bad input comes back through the `error` result with a zero value and a nil slice of merges; valid input never fails, except by overflow.
- **Empty is not nil.** With no piles or one pile, `MergePilesPlan` returns an empty `[]Merge{}`, like Python's `[]` and C++'s empty vector.
- **Bytes.** Indexing a `string` gives bytes, so a character that takes two bytes in UTF-8 is two positions: an `a`, an accented `e` and an `a` need 3 cuts here and none in Python, which compares code points.
- **Same output as Python.** The splits are tried in increasing order with a strict `<`, and the merges are read with the same stack; `TestAgreementWithPython` checks the costs, the merges, the coins and the cuts on inputs computed by the Python code. The unexported fill functions take a `*counters` that the tests use to count the candidates exactly.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/Interval_DP/Go"
go test ./...
go run main.go   # demo: the worked example and one call of each problem
```

## Key Takeaways

1. The fill order is a loop over lengths outside the loop over starts.
2. Return `ErrOverflow` rather than a wrapped-around number.
3. The costs, merges, coins and cuts agree with the Python and C++ versions.

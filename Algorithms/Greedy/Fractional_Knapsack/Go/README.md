# Fractional Knapsack -- Go Implementation

Greedy fractional knapsack in Go.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Item` and `FractionalKnapsack` (`package main`, no `main` function) |
| `main_test.go` | 4 tests (classic case, no item fits whole, empty and zero capacity, zero-weight items) |
| `go.mod` | module definition |

## API

| Name | Description |
|------|-------------|
| `type Item struct { Value, Weight float64 }` | one item |
| `FractionalKnapsack(items []Item, capacity float64) float64` | the maximum value; 0 for no items or capacity <= 0 |

```go
items := []Item{{60, 10}, {100, 20}, {120, 30}}
best := FractionalKnapsack(items, 50) // 240
```

The function returns only the value. The fractions taken are available in Python only.

## Go-Specific Notes

- `items` is **sorted in place** with `sort.Slice`: the caller's slice changes order. Copy it first if you need the original order.
- A zero-weight item gets `math.Inf(1)` as its ratio and is taken whole; before the fix, `0 * (0/0)` produced NaN.
- All numbers are `float64`; compare totals with a tolerance.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Greedy/Fractional_Knapsack/Go"
go test ./...
```

## Key Takeaways

- The input slice is sorted in place.
- Zero weight needs a special case (`math.Inf(1)`).
- Returns the value only.

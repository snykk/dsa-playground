# Activity Selection -- Go Implementation

Greedy activity selection (earliest finish first) in Go.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Activity` and `ActivitySelection` (`package main`, no `main` function) |
| `main_test.go` | 4 tests: basic, touching activities, empty and single input, input order kept |
| `go.mod` | module definition |

## API

| Name | Description |
|------|-------------|
| `type Activity struct { Start, Finish int }` | one activity |
| `ActivitySelection(activities []Activity) []int` | original indices of a maximum compatible set, in finish order; an empty slice for empty input |

```go
a := []Activity{{1, 4}, {3, 5}, {0, 6}, {5, 7}, {8, 9}}
picked := ActivitySelection(a) // [0 3 4]
```

Only the greedy function exists in Go. The weighted and recursive variants are Python only.

## Go-Specific Notes

- The function sorts an indexed copy with `sort.Slice`, so the caller's slice keeps its order (a test checks this).
- `sort.Slice` is not stable: among activities with equal finish times the chosen index is unspecified.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Greedy/Activity Selection/Go"
go test ./...
```

## Key Takeaways

- Sort `(index, activity)` pairs by `Finish`, then scan once.
- Use `>=` so that touching activities both fit.
- The input slice is left untouched.

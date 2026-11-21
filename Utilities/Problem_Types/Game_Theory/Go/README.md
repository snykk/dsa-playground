# Game Theory -- Go Implementation

## Files

| File | Contents |
|------|----------|
| `main.go` | six functions and a demo `main()` |
| `main_test.go` | tests, including brute-force game-tree checks of Nim and misere Nim |
| `go.mod` | module `game_theory` |

## API

| Function | Description |
|----------|-------------|
| `NimWinner(piles []int) bool` | first player wins iff XOR != 0 |
| `NimWinningMove(piles []int) (int, int)` | pile index and amount, or `-1, -1` |
| `Mex(s map[int]bool) int` | minimum excludant |
| `SubtractionGrundy(n int, moves []int) []int` | Grundy numbers for 0..n |
| `CombinedGrundy(states []int, grundyTables [][]int) int` | XOR of Grundy numbers |
| `MisereNimWinner(piles []int) bool` | misere Nim; empty piles are not counted |

Staircase Nim, Wythoff and Zeckendorf are Python/C++ only; Fibonacci Nim and game-graph analysis are Python only.

## Go-Specific Notes

- Sets are `map[int]bool`.
- The functions only read their arguments.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Go covers the Nim and Grundy core.
- Misere Nim counts non-empty piles only.

# Game Theory (Go)

Go implementation of game theory algorithms.

## Functions

- `NimWinner(piles)` - Check if first player wins in Nim
- `NimWinningMove(piles)` - Find winning move
- `Mex(s)` - Minimum excludant
- `SubtractionGrundy(n, moves)` - Calculate Grundy numbers
- `CombinedGrundy(states, tables)` - Combined game
- `MisereNimWinner(piles)` - Misère Nim

## Usage

```go
piles := []int{3, 4, 5}
winner := NimWinner(piles)
```


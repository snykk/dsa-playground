# Game Theory (C++)

C++ implementation of game theory algorithms.

## Functions

- `nimWinner(piles)` - Check if first player wins in Nim
- `nimWinningMove(piles)` - Find winning move
- `mex(s)` - Minimum excludant
- `subtractGrundy(n, moves)` - Calculate Grundy numbers
- `combinedGrundy(states, tables)` - Combined game
- `misereNimWinner(piles)` - Misère Nim

## Usage

```cpp
vector<int> piles = {3, 4, 5};
bool winner = nimWinner(piles);
```


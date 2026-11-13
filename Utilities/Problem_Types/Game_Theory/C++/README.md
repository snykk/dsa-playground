# Game Theory -- C++ Implementation

## Files

| File | Contents |
|------|----------|
| `game_theory.cpp` | the game functions and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `game_theory_test.cpp` | assert-based tests checked against brute-force game-tree search |

## API

| Function | Description |
|----------|-------------|
| `bool nimWinner(vi& piles)` | first player wins iff XOR != 0 |
| `pair<int,int> nimWinningMove(vi& piles)` | `{pile index, amount}` or `{-1, -1}` |
| `int mex(set<int>&)` | minimum excludant |
| `vi subtractGrundy(int n, vi& moves)` | Grundy numbers for 0..n |
| `int combinedGrundy(vi& states, vector<vi>& tables)` | XOR of Grundy numbers |
| `bool misereNimWinner(vi& piles)` | misere Nim; empty piles are not counted |
| `bool staircaseNim(vi& stairs)` | odd-indexed stairs; `stairs[0]` is the ground |
| `int hackenbushTree(vector<vi>& adj, int root = 0)` | Grundy value of Green Hackenbush on a tree |
| `bool canWin(int state, function<vi(int)> getMoves)` | generic memoised win/lose DP, fresh memo per call |
| `bool stoneGameDP(int n, int k)`, `bool wythoffWinner(int a, int b)`, `vi zeckendorf(int n)` | stone game, Wythoff, Zeckendorf |

There is no Fibonacci Nim and no game-graph analysis in C++.

## C++-Specific Notes

- Uses standard headers instead of `<bits/stdc++.h>`, so it compiles with clang on macOS.
- `hackenbushTree` computes `g(v) = XOR of (g(child) + 1)` with an iterative BFS order (no recursion).
- Wythoff uses `double`; exact for the sizes tested.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD game_theory_test.cpp -o test && ./test
g++ -std=c++17 -O2 game_theory.cpp -o demo && ./demo
```

## Key Takeaways

- Same results as Python for the shared functions.
- Hackenbush and `canWin` exist only in C++ (and `can_win` in Python).

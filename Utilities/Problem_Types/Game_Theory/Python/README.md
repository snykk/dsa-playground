# Game Theory -- Python Implementation

## Files

| File | Contents |
|------|----------|
| `game_theory.py` | the game functions and a demo under `if __name__ == "__main__"` |
| `game_theory_test.py` | tests checked against brute-force game-tree search |

## API

| Function | Description |
|----------|-------------|
| `nim_winner(piles)` | True if the first player wins (XOR != 0) |
| `nim_winning_move(piles)` | `(pile index, amount)` or `(-1, -1)` |
| `mex(s)` | smallest non-negative integer not in the set |
| `subtraction_grundy(n, moves)` | Grundy numbers for 0..n |
| `combined_grundy(states, tables)` | XOR of the Grundy numbers of independent games |
| `misere_nim_winner(piles)` | misere Nim; empty piles are not counted |
| `staircase_nim(stairs)` | XOR of odd-indexed stairs; `stairs[0]` is the ground |
| `wythoff_winner(a, b)`, `wythoff_cold_positions(limit)` | Wythoff's game |
| `can_win(state, get_moves, memo=None)` | generic memoised win/lose DP |
| `stone_game_dp(n, k)` | take 1..k stones, last to take wins |
| `zeckendorf(n)`, `fibonacci_nim_winner(n)` | Zeckendorf representation, Fibonacci Nim |
| `game_graph_outcomes(n, edges)` | `"win"`, `"lose"` or `"draw"` per node, cycles allowed |
| `analyze_game_graph(n, edges)` | booleans: True only for a win |

## Python-Specific Notes

- `can_win` is recursive; very deep states hit the recursion limit. A fresh memo is used per call unless you pass one.
- `game_graph_outcomes` is iterative (a queue), so cycles and long chains are safe.
- Wythoff uses `math.sqrt(5)`; exact for the sizes in the tests.

## How to Run

```bash
python3 -m unittest game_theory_test
python3 game_theory.py
```

## Key Takeaways

- Nim is one XOR; every impartial game is a Nim pile of size equal to its Grundy number.
- Misere Nim differs only when all piles have at most one object.

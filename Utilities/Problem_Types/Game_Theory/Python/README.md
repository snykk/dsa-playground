# Game Theory — Python Implementation

This folder implements the classical **impartial game** toolkit: Nim, Grundy numbers (nimbers), the MEX function, and misère-play variants. Once you know these, you can solve a surprising number of combinatorial-game problems — including ones that _look_ nothing like Nim.

For the conceptual overview, Sprague-Grundy theorem, and worked examples, see the parent README: [../README.md](../README.md)

---

## Functions Included

| Function | Returns | What it tells you |
|----------|---------|-------------------|
| `nim_winner(piles)` | `bool` | `True` if first player wins standard Nim (XOR ≠ 0) |
| `nim_winning_move(piles)` | `(pile_idx, remove_count)` | One move that preserves the win |
| `mex(s)` | `int` | Smallest non-negative integer not in set `s` |
| `subtraction_grundy(n, moves)` | `List[int]` | Grundy numbers for a subtraction game |
| `combined_grundy(states, tables)` | `int` | XOR of Grundy values across independent sub-games |
| `misere_nim_winner(piles)` | `bool` | Winner under misère rule (last move loses) |

---

## Python-Specific Notes

- **XOR is `^` in Python** and works on arbitrary-precision `int` — no overflow concerns at any pile size.
- **`functools.reduce` for the Nim XOR sum**: `reduce(xor, piles, 0)` or `reduce(operator.xor, piles, 0)` is idiomatic. Equivalent to `nim_sum = 0; for p in piles: nim_sum ^= p`.
- **Memoization with `functools.lru_cache`**: Grundy tables on state-heavy games benefit from `@lru_cache(maxsize=None)`. The decorator turns an exponential recursion into a polynomial memo.
- **Sets for MEX**: `mex(s)` is O(n) if `s` is a Python `set` — start at 0 and increment until you find a gap. Sorted lists also work but add an unnecessary log factor.
- **Misère is not just "flip the answer"**: the classic trick is that misère Nim has the same winner as normal Nim _except_ when every pile has size 1. Encode that edge case explicitly.

---

## How to Run

```bash
python3 -m unittest game_theory_test.py
```

---

## Key Takeaways for Learners

1. **Nim's XOR rule is the whole game.** First player wins iff the XOR of pile sizes is non-zero. This one theorem unlocks every "impartial game with separable heaps" problem.
2. **Grundy numbers generalize Nim.** For a single game, `G(state) = mex(G(next) for next in moves)`. For a sum of independent games, XOR the Grundy numbers of the components. That's the Sprague-Grundy theorem in one line.
3. **Misère variants have sharp edge cases.** "Last move loses" games usually match standard-play winners except in a small handful of terminal configurations. Always test the terminal cases explicitly.

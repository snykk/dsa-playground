# Game Theory — C++ Implementation

This folder implements the classical **impartial game** toolkit: Nim, Grundy numbers (nimbers), the MEX function, and misère variants. The Sprague-Grundy theorem says every impartial game is equivalent to a Nim heap with Grundy value `G(state)` — so learning these tools unlocks a large slice of combinatorial-game problems.

For the conceptual overview and worked examples, see the parent README: [../README.md](../README.md)

---

## Functions Included

| Function | Returns | Tells you |
|----------|---------|-----------|
| `nimWinner(piles)` | `bool` | True iff XOR(piles) ≠ 0 |
| `nimWinningMove(piles)` | `pair<int,int>` | `(pile_idx, remove_count)` |
| `mex(s)` | `int` | Smallest non-negative int not in `s` |
| `subtractGrundy(n, moves)` | `vector<int>` | Grundy values for subtraction games |
| `combinedGrundy(states, tables)` | `int` | XOR of component Grundy values |
| `misereNimWinner(piles)` | `bool` | Winner under misère rule |

---

## C++-Specific Notes

- **`int` XOR is fine for typical pile sizes** (up to 2³¹ − 1). For massive piles or large nim-values, use `int64_t` / `uint64_t` — XOR never "overflows" numerically.
- **`std::accumulate` for Nim sum**: `std::accumulate(piles.begin(), piles.end(), 0, std::bit_xor<>())` — idiomatic one-liner.
- **MEX with `std::set<int>` or `std::vector<bool>`**: for dense sets, a bool array of size `|s| + 1` is faster. Linear scan up from 0 until you find a false cell.
- **Memoization via `std::unordered_map<State, int>`**: for games with complex state, cache Grundy values. Use a hash functor for custom state types.
- **Be precise about state equivalence**: games that look different may share Grundy values. Always enumerate moves in _canonical form_ before memoizing — otherwise your memo misses hits.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall game_theory_test.cpp -o game_theory_test
./game_theory_test
```

---

## Key Takeaways for Learners

1. **Nim's XOR rule is one line, one theorem, huge applicability.** Any problem that separates into independent heaps with subtraction rules is Nim in disguise.
2. **Sprague-Grundy unifies impartial games.** For a single game: Grundy number = MEX of next-states' Grundy numbers. For a sum: XOR. That's it.
3. **Memoize Grundy values aggressively.** Naïve recursion on game states is exponential; adding `unordered_map` memoization routinely turns 10-second solutions into 10-millisecond ones.

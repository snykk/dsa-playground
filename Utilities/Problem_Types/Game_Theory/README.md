# Game Theory

Impartial two-player games (both players have the same moves, the player who cannot move loses) can be solved without searching the game tree. Nim reduces to one XOR; the Sprague-Grundy theorem gives every position a Grundy number so that independent games combine by XOR.

## Intuition

A position is a **P-position** if the player to move loses (every move leads to an N-position) and an **N-position** if some move leads to a P-position. For Nim, the P-positions are exactly those whose pile sizes XOR to 0: from XOR 0 every move makes it non-zero, and from non-zero you can always move back to zero (reduce a pile that has the highest set bit of the XOR).

Grundy number: `g(s) = mex { g(t) : t reachable from s }`, where mex is the smallest non-negative integer not in the set. `g(s) = 0` exactly when `s` is a P-position, and a sum of independent games has Grundy number equal to the XOR of the parts.

## Visual

```text
Nim [3, 4, 5]                        Subtraction game {1, 3, 4}
  3 = 011                            n    : 0 1 2 3 4 5 6 7 8 9 10 11 12
  4 = 100                            g(n) : 0 1 0 1 2 3 2 0 1 0 1  2  3
  5 = 101
  XOR = 010 (non-zero)               g(6) = mex{ g(5)=3, g(3)=1, g(2)=0 } = 2
  winning move: take 2 from pile 0 -> [1, 4, 5], XOR = 0
```

## How It Works

1. **Normal Nim**: first player wins iff the XOR of the piles is non-zero. `nim_winning_move` returns `(pile index, amount)` that makes the XOR zero, or `(-1, -1)` when losing.
2. **Grundy numbers**: compute `g` bottom-up with `mex`; XOR the numbers of independent games (`combined_grundy`).
3. **Misere Nim** (last mover loses): same as Nim unless every pile has at most one object; then the first player wins iff the number of **non-empty** piles is even.
4. **Other games**: Wythoff (cold positions `(floor(k*phi), floor(k*phi^2))`), staircase Nim (XOR of the odd-indexed stairs, `stairs[0]` is the ground), stone game (`n % (k + 1) != 0`), Fibonacci Nim (first player loses iff n is a Fibonacci number), Green Hackenbush on a tree (`g(v) = XOR of g(c) + 1` over children), and win/lose/draw analysis on a directed graph by retrograde analysis.

## Step-by-Step Trace

Misere versus normal Nim:

| Piles | Normal | Misere |
|-------|--------|--------|
| `[1]` | first wins | first loses |
| `[1, 1]` | first loses | first wins |
| `[1, 1, 1]` | first wins | first loses |
| `[0, 1]` | first wins | first loses (the empty pile does not count) |
| `[1, 2]` | first wins | first wins |
| `[2, 2]` | first loses | first loses |

Graph with edges `0->1, 1->0, 1->2`: node 2 has no move (lose); node 1 can move there (win); node 0 only reaches 1 (lose). Without the edge `1->2`, nodes 0 and 1 are draws.

## Complexity

| Operation | Time |
|-----------|------|
| Nim winner, winning move | O(k) for k piles |
| Subtraction Grundy table up to n | O(n * m), m = number of moves |
| Grundy of a sum of games | O(number of games) |
| Game graph (retrograde analysis) | O(V + E) |
| Generic `can_win` | O(states * moves), memoised |
| Wythoff test | O(1), floating-point golden ratio |

## When to Use

Use it for impartial games with perfect play, especially when the game splits into independent parts. It does not apply to partisan games (different moves per player), and misere play of general sums does not reduce to Grundy numbers.

## Game Theory Tools vs. Alternatives

| Approach | Handles | Cost |
|----------|---------|------|
| XOR / Grundy numbers | impartial games, independent sums | arithmetic or a small DP |
| Win/lose DP over states | any acyclic game | states * moves |
| Retrograde analysis | games with cycles and draws | V + E |
| Minimax | partisan games with scores | exponential without pruning |

## Common Pitfalls

- Using the normal-play rule for misere Nim, or counting empty piles in the all-ones case.
- Wrong staircase indices: stones on index 0 are out of play.
- Treating a draw as a loss on cyclic graphs (`analyze_game_graph` returns False for both; `game_graph_outcomes` tells them apart).
- Sharing a memo between different games.
- Wythoff uses floating point; it is checked against brute force for sizes below 30.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `game_theory.py` | 15 functions incl. Fibonacci Nim, Wythoff cold positions, game-graph outcomes |
| C++ | [C++/](C++/) | `game_theory.cpp` | adds Hackenbush on trees and `canWin`; no Fibonacci Nim, no game graph |
| Go | [Go/](Go/) | `main.go` | 6 functions: Nim, mex, subtraction Grundy, combined Grundy, misere Nim |

All three are tested against brute-force game-tree search.

## Practice Problems

- [LeetCode 292 - Nim Game](https://leetcode.com/problems/nim-game/)
- [LeetCode 877 - Stone Game](https://leetcode.com/problems/stone-game/)
- [CSES - Nim Game I](https://cses.fi/problemset/task/1730)
- [CSES - Stick Game](https://cses.fi/problemset/task/1729)

## Related

- [Constructive Algorithms](../Constructive_Algorithms/)
- [Interactive Problems](../Interactive_Problems/)
- [Bit Manipulation](../../../Problem_Patterns/Bit_Manipulation/)

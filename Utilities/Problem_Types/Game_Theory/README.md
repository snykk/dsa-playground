# Game Theory Basics

Essential game theory concepts for competitive programming.

## Nim Game

### Classic Nim
- Two players take turns removing objects from piles
- Take any number from one pile per turn
- Last player to move wins
- **First player wins iff XOR of all piles ≠ 0**

```cpp
bool nimWinner(vector<int>& piles) {
    int xorSum = 0;
    for (int pile : piles) xorSum ^= pile;
    return xorSum != 0;  // First player wins
}
```

### Misère Nim
- Same as Nim, but last to move **loses**
- Different only when all piles are 1

```cpp
bool misereWinner(vector<int>& piles) {
    int xorSum = 0;
    bool allOnes = true;
    for (int pile : piles) {
        xorSum ^= pile;
        if (pile > 1) allOnes = false;
    }
    if (allOnes) return piles.size() % 2 == 0;
    return xorSum != 0;
}
```

## Sprague-Grundy Theorem

Every impartial game is equivalent to a Nim heap:
- **Grundy(state) = mex({Grundy(next_states)})**
- **mex** = minimum excludant (smallest non-negative integer not in set)

```cpp
int mex(set<int>& s) {
    int result = 0;
    while (s.count(result)) result++;
    return result;
}
```

### Combined Games
- Grundy(combined) = XOR of individual Grundy numbers
- Game is losing position iff combined Grundy = 0

## Common Game Patterns

| Game | Winning Condition |
|------|-------------------|
| Nim | XOR ≠ 0 |
| Misère Nim | XOR ≠ 0 (or all ones with even count) |
| Subtraction | Use Grundy table |
| Staircase Nim | XOR of odd-indexed stairs ≠ 0 |
| Wythoff | Not a cold position (golden ratio) |
| Fibonacci Nim | n is not a Fibonacci number |

## Wythoff's Game

Two piles; can take any from one pile or equal from both.

```python
phi = (1 + sqrt(5)) / 2  # Golden ratio
# Cold positions: (floor(k*phi), floor(k*phi^2))
# First player wins if NOT at cold position
```

## DP Approach

For complex games, use dynamic programming:

```cpp
bool canWin(int state) {
    if (memo.count(state)) return memo[state];
    
    for (int next : getMoves(state)) {
        if (!canWin(next)) {
            return memo[state] = true;  // Found losing position for opponent
        }
    }
    return memo[state] = false;
}
```

## Key Theorems

1. **Zermelo's Theorem**: Every finite game has optimal strategy
2. **Sprague-Grundy**: Every impartial game = Nim heap
3. **XOR Principle**: Combined games use XOR of Grundy numbers

## Problem-Solving Tips

1. Identify if game is impartial (same moves for both players)
2. Look for Nim-like structure
3. Calculate small cases to find pattern
4. Use DP for complex state spaces
5. Check for periodicity in Grundy numbers


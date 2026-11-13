# Manacher's Algorithm -- C++ Implementation

Longest palindromic substring in O(n).

## Files

| File | Contents |
|------|----------|
| `manacher.cpp` | `manacher` |
| `manacher_test.cpp` | `assert`-based tests: basic, single character, all equal, no palindrome, long palindrome, empty string, two characters, inputs containing `^` and `$` (regression), tie-breaking |

## API

- `std::string manacher(const std::string& s)`: the first longest palindromic substring (the earliest on ties); `""` for an empty string.

```cpp
manacher("babad");   // "bab"
```

## C++-Specific Notes

- Works on bytes. A multi-byte UTF-8 palindrome such as a word of accented letters is found only when its bytes form a palindrome; decode to code points first for character-level results.
- The transformed `std::string` uses `#` between bytes and no sentinels; expansion is bounds-checked, so `^`, `$` and `#` are safe in the input.
- `int` is used for sizes, which is fine for any string that fits in memory comfortably with the 2n + 1 buffer.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD manacher_test.cpp -o manacher_test
./manacher_test
```

## Key Takeaways

1. Bounds-checked expansion replaces sentinels.
2. The answer starts at `(i - p[i]) / 2` in the original string.

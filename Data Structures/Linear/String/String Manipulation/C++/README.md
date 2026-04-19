# String Manipulation — C++ Implementation

This folder implements **common string operations** from scratch in C++: reverse, palindrome, vowel count, replace, case conversion, split, join. The goal is to understand what each operation costs when written over `std::string`.

For the conceptual overview and cross-language comparison, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `string_manipulation.cpp` | Reference implementations of the eight core operations |
| `string_manipulation_test.cpp` | Assertion-based unit tests |

---

## Operations Covered

| Operation | Stdlib equivalent | Complexity |
|-----------|-------------------|------------|
| `reverse_string(s)` | `std::reverse(s.begin(), s.end())` | O(n) |
| `is_palindrome(s)` | two-pointer walk | O(n), O(1) space |
| `count_vowels(s)` | `std::count_if` with predicate | O(n) |
| `replace_char(s, old, new)` | `std::replace` | O(n) |
| `to_upper / to_lower` | `std::transform` + `std::toupper` | O(n) |
| `split_string(s, sep)` | `std::getline` on `std::stringstream` | O(n) |
| `join_string(parts, sep)` | manual loop | O(total) |

---

## C++-Specific Notes

- **`<algorithm>` is the goldmine**: `std::reverse`, `std::count_if`, `std::transform`, `std::replace` — all three-argument iterator-based versions that work on `std::string` directly.
- **`std::toupper` / `std::tolower` take an `int`.** Casting `char` to `unsigned char` before passing avoids undefined behavior on negative values (very real with UTF-8 bytes).
- **Split has no stdlib equivalent before C++20.** We use `std::stringstream` + `std::getline(ss, token, sep)`. C++20 added `std::ranges::split_view` but support is still uneven.
- **Reserve capacity when joining.** `result.reserve(total_size)` before concatenation avoids repeated reallocation — classic O(n²) → O(n) fix.
- **Two-pointer palindrome beats reverse-and-compare** on memory: O(1) extra vs O(n) for the reversed copy.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall string_manipulation_test.cpp -o string_manipulation_test
./string_manipulation_test
```

---

## Key Takeaways for Learners

1. **Reach for `<algorithm>` before writing your own loop.** It's battle-tested, optimizer-friendly, and one line. Writing `for (auto& c : s) c = std::toupper(c)` is fine; writing `std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c){ return std::toupper(c); })` signals C++ fluency.
2. **Know the SSO (Small String Optimization) threshold** on your stdlib (~15 chars for libstdc++). Operations on short strings may be free of heap allocation entirely.
3. **C++ string handling is byte-level.** UTF-8 support needs an external library (ICU, utf8cpp) for case conversion and grapheme iteration. Don't assume `toupper` does the right thing on non-ASCII input.

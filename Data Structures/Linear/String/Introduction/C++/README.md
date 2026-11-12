# Introduction to Strings -- C++ Implementation

## Files

| File | Contents |
| --- | --- |
| `main.cpp` | the five string functions (no `main()` function) |
| `main_test.cpp` | assert-based tests; includes `main.cpp` directly |

## API

- `char access_char(const string&, int index)`: `s[index]`; undefined behaviour out of range. O(1).
- `int string_length(const string&)`: size in bytes. O(1).
- `vector<char> traverse_string(const string&)`: the bytes as chars. O(n).
- `string concatenate(const string&, const string&)`. O(n + m).
- `string substring(const string&, int start, int end)`: bytes `[start, end)`; both ends are clamped to `[0, size]` and an empty range returns `""`. O(k).

## C++-Specific Notes

- `std::string` is a mutable byte sequence. It knows nothing about UTF-8: the accented letter in `h` + e-acute + `llo` is two `char` values and `size()` is 6.
- `s[i]` is not bounds checked; `s.at(i)` throws `std::out_of_range`. `access_char` uses `s[i]`.
- `substr(pos, len)` throws when `pos > size()`; the helper clamps first so it never throws.
- `std::string::operator+=` is amortized O(1) per append, so a loop of appends is O(n), unlike immutable strings.
- The file is named `main.cpp` but has no `main()`: the test includes it.

## How to Run

```bash
cd "Data Structures/Linear/String/Introduction/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD main_test.cpp -o /tmp/string_intro && /tmp/string_intro
```

## Key Takeaways

- `size()` counts bytes, not characters.
- Clamp or check ranges before `substr`.
- `+=` on a `std::string` is cheap; `a + b` creates a new one.

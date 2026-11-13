# String Manipulation -- C++ Implementation

## Files

| File | Contents |
| --- | --- |
| `string_manipulation.cpp` | the eight functions (no `main()`) |
| `string_manipulation_test.cpp` | assert-based tests; includes the `.cpp` directly |

## API

- `string reverse_string(const string&)`: `std::reverse` on a copy.
- `bool is_palindrome(const string&)`: two pointers over the bytes; O(1) extra space.
- `int count_vowels(const string&)`: counts bytes in `aeiouAEIOU`.
- `string replace_char(string s, char oldc, char newc)`: replaces one byte value.
- `string to_upper(string)`, `string to_lower(string)`: ASCII case conversion.
- `vector<string> split_string(const string&, char sep = ' ')`: keeps empty fields; `""` gives `{""}`.
- `string join_string(const vector<string>&, const string& sep = " ")`.

## C++-Specific Notes

- `std::string` is a byte sequence. Reversing a UTF-8 string reverses its bytes and corrupts multi-byte characters; `is_palindrome` compares bytes too.
- `to_upper` and `to_lower` cast each byte to `unsigned char` before calling `toupper` / `tolower`, as `<cctype>` requires. Bytes above 127 are left unchanged, so only ASCII letters change.
- `split_string` is a `find` loop; unlike a `getline` loop it keeps a trailing empty field and returns `{""}` for an empty input, matching Python and Go.
- `std::string::operator+=` is amortized O(1) per append, so `join_string` is O(total length).
- `replace_char` takes a single `char`, not a substring.

## How to Run

```bash
cd "Data_Structures/Linear/String/String_Manipulation/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD string_manipulation_test.cpp -o /tmp/string_manip && /tmp/string_manip
```

## Key Takeaways

- Bytes are not characters: decode first for Unicode.
- Cast to `unsigned char` before `toupper` and `tolower`.
- A `find` loop keeps empty fields; a `getline` loop drops a trailing one.

# Rabin-Karp Algorithm

Rabin-Karp compares a hash of each text window with the hash of the pattern, and compares characters only when the hashes agree. A rolling hash updates in O(1) as the window slides, which gives O(n + m) expected time; the worst case is O(n*m).

## Intuition

Comparing two strings of length `m` costs O(m); comparing two numbers costs O(1). Turn every window of the text into a number and compare numbers. The hash is a base-256 number reduced modulo a prime `q`, so sliding the window by one position is just "remove the leading digit, shift, add the new trailing digit".

Different strings can share a hash (a collision, or spurious hit), but equal strings always share one. So a hash mismatch is a proof, and a hash match is a candidate that is verified character by character. The answer is always exact; the modulus only affects speed.

## Visual

Pattern `AB`, text `XJUAB`, base 256, modulus 101. The pattern hash is 41.

```text
text:    X    J    U    A    B
window:  XJ   JU   UA   AB
hash:    79   41   9    41
         no   hit  no   hit
              |         |
        JU != AB:      AB == AB:
        spurious,      match at 3
        rejected
```

## How It Works

1. Compute `h = 256^(m-1) mod q`, the pattern hash and the first window's hash with Horner's rule: `hash = (256 * hash + code(c)) mod q`.
2. For each window start `i`: if the window hash equals the pattern hash, compare the characters; record `i` on a full match.
3. Roll to the next window: `hash = (256 * (hash - code(text[i]) * h) + code(text[i+m])) mod q`, adding `q` if the result is negative.

An empty pattern, an empty text, or a pattern longer than the text returns `[]` in all three languages.

## Step-by-Step Trace

Text `XJUAB`, pattern `AB`; codes `X=88 J=74 U=85 A=65 B=66`; `h = 256 mod 101 = 54`.

| Window | Text | Hash | Equals 41? | Result |
|--------|------|------|------------|--------|
| 0 | `XJ` | 79 | no | skip |
| 1 | `JU` | 41 | yes | characters differ: spurious hit, rejected |
| 2 | `UA` | 9 | no | skip |
| 3 | `AB` | 41 | yes | characters equal: match at 3 |

The first roll: `(256 * (79 - 88 * 54) + 85) mod 101 = 41`.

## Complexity

| Case | Time | When |
|------|------|------|
| Best / expected | O(n + m) | few collisions: O(m) setup, O(1) per window, O(m) per real match |
| Worst | O(n*m) | every window has the pattern's hash, or the text is full of real matches (`AAAAA` with `AAA`) |

Extra space is O(1). The default modulus 101 is small, so about 1 window in 101 shares the pattern hash by chance; results stay correct because hits are verified, but a large prime is better for real inputs. With a large modulus the C++ and Go `int` arithmetic needs 64-bit products (`base * (hash - lead * h)` is about `256 * mod * mod`).

## When to Use

- Many patterns of the same length: hash them all into a set and look each window up.
- Fingerprinting and duplicate detection, 2D pattern matching.
- Not when a guaranteed bound matters for one pattern (KMP) or for long patterns on large alphabets (Boyer-Moore).

## Rabin-Karp vs. Alternatives

| Algorithm | Expected | Worst | Extra space |
|-----------|----------|-------|-------------|
| Rabin-Karp | O(n + m) | O(n*m) | O(1) |
| Naive | O(n) | O(n*m) | O(1) |
| KMP | O(n + m) | O(n + m) | O(m) |
| Boyer-Moore (bad character) | O(n/m) | O(n*m) | O(sigma) |

## Common Pitfalls

- Trusting equal hashes without verifying.
- Negative hashes after the rolling step in C++ and Go; normalise them. Python's `%` is already non-negative.
- Hashing signed `char` values in C++: bytes of 0x80 or more go negative; the code hashes `unsigned char`.
- Using the wrong power: `h` is `base^(m-1)`.
- A tiny modulus on adversarial text: correct but slow.
- Calling real matches (`AAAAA` with `AAA`) collisions.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `rabin_karp.py` | `base` and `mod` are parameters (defaults 256, 101); also `_count`, `_first` |
| C++ | [C++/](C++/) | `rabin_karp.cpp` | constants 256 and 101; hashes `unsigned char` values |
| Go | [Go/](Go/) | `main.go` | constants 256 and 101; hashes `byte` values |

## Practice Problems

- [LeetCode 28: Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/)
- [LeetCode 187: Repeated DNA Sequences](https://leetcode.com/problems/repeated-dna-sequences/)
- [LeetCode 1044: Longest Duplicate Substring](https://leetcode.com/problems/longest-duplicate-substring/)
- [LeetCode 686: Repeated String Match](https://leetcode.com/problems/repeated-string-match/)

## Related

- [Naive Pattern Search](../Naive%20Pattern%20Search/)
- [KMP Algorithm](../KMP%20Algorithm/)
- [Boyer-Moore Algorithm](../Boyer-Moore%20Algorithm/)
- [Aho-Corasick](../../Advanced_String/Aho-Corasick/)
- [String Pattern Matching (overview)](../../../../Data%20Structures/Linear/String/Pattern%20Matching/)

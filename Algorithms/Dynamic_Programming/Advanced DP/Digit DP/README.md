# Digit DP

Digit DP counts the integers in a range whose decimal digits satisfy a rule (for example "digit sum equals S") by building each number one digit at a time and memoizing on the position, a tight flag and a small running state. It handles bounds like 10^18 in O(d * S * 10) steps, where d is the number of digits.

## Intuition

A bound such as 10^18 is too large to loop over, but a number has only about 18 digits, and many rules depend on the digits only through a short summary (the sum so far, the remainder, the previous digit). Two different prefixes with the same summary have the same set of possible completions, so they share one memo entry.

The one subtlety is the bound itself. While the digits chosen so far equal the bound's prefix the state is **tight**, and the next digit may not exceed the bound's digit. Once a smaller digit is chosen the state is **free**: any digit 0 to 9 may follow.

## Visual

Counting numbers 0..25 with digit sum 5 (digit array `[2, 5]`):

```text
                start (tight, sum 0)  -> 3
        /              |                \
   first digit 0   first digit 1     first digit 2
   free, sum 0     free, sum 1       tight, sum 2
       |               |                  |
   last digit 5    last digit 4       last digit 3   (limit is 5)
      "05"            "14"               "23"
```

## How It Works

1. Turn `n` into its list of digits, most significant first. Leading zeros are allowed, so all numbers have the same length.
2. State: `dp(pos, tight, sum)`.
3. At `pos`, the limit is `digits[pos]` if `tight` else 9. Try each `d` from 0 to the limit; the next state is `tight and d == limit`, `sum + d`. Skip a digit if the sum would exceed the target.
4. Base case: at the end of the digits return 1 if `sum == target`, else 0.
5. Memoize on `(pos, tight, sum)`.
6. For a range, use `count(R) - count(L - 1)`. `count(n)` returns 0 for `n < 0`.

## Step-by-Step Trace

`count_numbers_with_digit_sum(25, 5)`:

| State `(pos, tight, sum)` | Meaning | Result |
|---------------------------|---------|--------|
| `(0, tight, 0)` | nothing chosen yet | 3 |
| `(1, free, 0)` | first digit 0; last digit must be 5 | 1 (number 5) |
| `(1, free, 1)` | first digit 1; last digit must be 4 | 1 (number 14) |
| `(1, tight, 2)` | first digit 2; last digit is at most 5, must be 3 | 1 (number 23) |

The answer is 3. Range example: `count(100, 5) - count(9, 5) = 6 - 1 = 5`, the numbers 14, 23, 32, 41 and 50.

## Complexity

| | Time | Space |
|---|------|-------|
| `count_numbers_with_digit_sum` | O(d * target * 10) | O(d * target) |

d is the number of digits of `n`. There are d positions, 2 values of `tight` and at most `target + 1` sums, and each state tries up to 10 digits.

## When to Use

- Count integers up to a huge bound with a property of their digits and a small state.
- Do not use it when a plain loop fits (N up to about 10^7) or when the property has a simple closed form.

## Digit DP vs. Alternatives

| Approach | Time | Use when |
|----------|------|----------|
| Loop over 0..N | O(N * d) | N up to about 10^7 |
| Closed-form counting | O(1) to O(d) | the rule has a simple formula |
| Digit DP | O(d * S * 10) | a large bound and a small state |

## Common Pitfalls

- Leaving `tight` out of the memo key.
- `L - 1 = -1` when `L = 0`: this implementation returns 0 for `n < 0`, so the range formula works.
- Leading zeros: harmless for digit sums, but rules about the digit 0 or adjacent digits need a `started` flag.
- Reusing the memo for a different bound.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `digit_dp.py` | Complete counter for digit sums; 5 tests |
| C++ | [C++](C++/) | `digit_dp.cpp` | Placeholder: comment-only stub, test only prints a message |
| Go | [Go](Go/) | `main.go` | Placeholder: package stub, test asserts nothing |

## Practice Problems

- [Count Numbers with Unique Digits (LeetCode 357)](https://leetcode.com/problems/count-numbers-with-unique-digits/)
- [Numbers With Repeated Digits (LeetCode 1012)](https://leetcode.com/problems/numbers-with-repeated-digits/)
- [Number of Digit One (LeetCode 233)](https://leetcode.com/problems/number-of-digit-one/)
- [Digit Sum (AtCoder Educational DP Contest, problem S)](https://atcoder.jp/contests/dp/tasks/dp_s)

## Related

- [Bitmask DP](../Bitmask%20DP/)
- [DP Problem Patterns](../../../../Problem_Patterns/DP%20Problem%20Patterns/)
- [Prefix Sum and Difference Array](../../../../Problem_Patterns/Prefix%20Sum%20Difference%20Array/)
- [DP on Trees](../DP%20on%20Trees/)

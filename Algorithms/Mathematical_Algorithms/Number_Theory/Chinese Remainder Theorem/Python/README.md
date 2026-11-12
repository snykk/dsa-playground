# Chinese Remainder Theorem -- Python Implementation

## Files

- `chinese_remainder_theorem.py`: the functions below plus a small demo under `__main__`.
- `chinese_remainder_theorem_test.py`: unit tests (basic, two and three congruences, not coprime, pairwise, verify, large moduli, negative remainders, solvable non-coprime systems, a signed extended-gcd identity check and a brute-force comparison on random systems).

## API

- `extended_gcd(a, b)`: returns `(g, x, y)` with `a*x + b*y == g == gcd(a, b)`, for inputs of any sign.
- `chinese_remainder_theorem(remainders, moduli)`: smallest non-negative `x` satisfying every congruence, or `None` if the lengths differ, a modulus is not positive, or the system has no solution. Moduli need not be coprime; the solution is unique modulo their lcm. An empty system returns 0.
- `chinese_remainder_theorem_pairwise(a1, m1, a2, m2)`: two congruences with coprime moduli; `None` if they are not coprime.
- `verify_crt_solution(x, remainders, moduli)`: True if `x` satisfies all congruences (remainders are reduced first, so `8 mod 3` equals `2`).

```python
from chinese_remainder_theorem import chinese_remainder_theorem

print(chinese_remainder_theorem([2, 3, 2], [3, 5, 7]))  # 23
print(chinese_remainder_theorem([1, 3], [4, 6]))        # 9  (not coprime, still solvable)
print(chinese_remainder_theorem([1, 2], [4, 6]))        # None (contradiction)
```

## Python-Specific Notes

- Integers are arbitrary precision, so there is no overflow and the lcm can grow without bound.
- Remainders may be negative: they are reduced with `%`, which always gives a non-negative result.
- Needs Python 3.9 or later (no newer syntax is used).

## How to Run

```bash
python3 -m unittest chinese_remainder_theorem_test
python3 chinese_remainder_theorem.py
```

## Key Takeaways

- Merge one congruence at a time; the running modulus is the lcm so far.
- A merge fails exactly when `r1` and `r2` differ modulo `gcd(m1, m2)`.
- Always reduce remainders first, and verify with the same reduction.

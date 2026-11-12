# Inclusion-Exclusion Principle -- Python Implementation

Union counting over divisors and over explicit sets. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `inclusion_exclusion.py` | `count_divisible`, `count_union_sets`, `gcd` and a demo `main` |
| `inclusion_exclusion_test.py` | Unit tests with exact expected values |

## API

- `count_divisible(n, divisors)`: numbers in `1..n` divisible by at least one divisor (divisors at least 1).
- `count_union_sets(sets)`: size of the union of the given lists, treated as sets.
- `gcd(a, b)`: greatest common divisor.

## Python-Specific Notes

- Integers never overflow, so the lcm needs no pruning.
- Both functions enumerate `2**k` bitmasks, so keep k small.
- `count_union_sets` converts each list to a `set` for every mask that uses it.

## How to Run

```bash
python3 -m unittest inclusion_exclusion_test
python3 inclusion_exclusion.py
```

## Key Takeaways

- Odd subsets add, even subsets subtract.
- Divisor intersections use the lcm.
- Start each intersection from the first set in the subset.

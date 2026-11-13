# Inclusion-Exclusion Principle -- C++ Implementation

Union counting over divisors and over explicit sets. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `inclusion_exclusion.cpp` | `gcd`, `countDivisible`, `countUnionSets` and a demo `main` |
| `inclusion_exclusion_test.cpp` | Assert-based tests (includes the `.cpp`) |

## API

- `long long gcd(long long a, long long b)`
- `int countDivisible(int n, const vector<int>& divisors)`: numbers in `1..n` divisible by at least one divisor (divisors at least 1).
- `int countUnionSets(const vector<vector<int>>& sets)`: size of the union.

## C++-Specific Notes

- The lcm is a `long long` and a subset is skipped once the lcm exceeds `n`, so the product cannot overflow; the running total is also `long long`.
- `1 << k` is an `int` shift, so at most 30 divisors or sets.
- `countUnionSets` uses `std::set` for intersections.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD inclusion_exclusion_test.cpp -o ie_test && ./ie_test
g++ -std=c++17 -O2 -Wall inclusion_exclusion.cpp -o ie_demo && ./ie_demo
```

## Key Takeaways

- Widen before multiplying, and prune when the lcm passes `n`.
- Compare with a brute-force count in tests.
- Keep k small: the work is 2^k.

# Precomputation Techniques

Precomputation trades memory for time by computing values before they are needed.

## Common Precomputation Patterns

### Factorial and Inverse Factorial

```cpp
void precompute() {
    fact[0] = 1;
    for (int i = 1; i < MAXN; i++)
        fact[i] = fact[i-1] * i % MOD;
    
    invFact[MAXN-1] = power(fact[MAXN-1], MOD-2);
    for (int i = MAXN-2; i >= 0; i--)
        invFact[i] = invFact[i+1] * (i+1) % MOD;
}

ll nCr(int n, int r) {
    return fact[n] * invFact[r] % MOD * invFact[n-r] % MOD;
}
```

### Prime Sieve

```cpp
void sieve() {
    fill(isPrime, isPrime + MAXN, true);
    isPrime[0] = isPrime[1] = false;
    for (int i = 2; i < MAXN; i++) {
        if (isPrime[i]) {
            primes.push_back(i);
            for (int j = 2*i; j < MAXN; j += i)
                isPrime[j] = false;
        }
    }
}
```

### Smallest Prime Factor

```cpp
void computeSPF() {
    for (int i = 0; i < MAXN; i++) spf[i] = i;
    for (int i = 2; i*i < MAXN; i++) {
        if (spf[i] == i) {
            for (int j = i*i; j < MAXN; j += i)
                if (spf[j] == j) spf[j] = i;
        }
    }
}
```

### Prefix Sums

```cpp
// 1D
for (int i = 0; i < n; i++)
    prefix[i+1] = prefix[i] + arr[i];
// range sum [l, r]
ll sum = prefix[r+1] - prefix[l];

// 2D
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        prefix[i][j] = grid[i-1][j-1] + prefix[i-1][j] 
                     + prefix[i][j-1] - prefix[i-1][j-1];
```

### Sparse Table (RMQ)

```cpp
// Build O(n log n)
for (int i = 0; i < n; i++) sparse[i][0] = arr[i];
for (int j = 1; j < LOG; j++)
    for (int i = 0; i + (1<<j) <= n; i++)
        sparse[i][j] = min(sparse[i][j-1], 
                          sparse[i+(1<<(j-1))][j-1]);

// Query O(1)
int rangeMin(int l, int r) {
    int k = log[r-l+1];
    return min(sparse[l][k], sparse[r-(1<<k)+1][k]);
}
```

## Complexity Summary

| Precomputation | Build | Query | Space |
|---------------|-------|-------|-------|
| Factorials | O(n) | O(1) | O(n) |
| Prime Sieve | O(n log log n) | O(1) | O(n) |
| SPF | O(n log log n) | O(log n) | O(n) |
| Prefix Sum 1D | O(n) | O(1) | O(n) |
| Prefix Sum 2D | O(nm) | O(1) | O(nm) |
| Sparse Table | O(n log n) | O(1) | O(n log n) |
| Binary Lifting | O(n log n) | O(log n) | O(n log n) |

## When to Precompute

- **Multiple queries**: Same data queried many times
- **Time-critical**: Trading memory for speed
- **Static data**: Data doesn't change after setup
- **Range queries**: Prefix sums, sparse tables
- **Graph queries**: LCA, reachability


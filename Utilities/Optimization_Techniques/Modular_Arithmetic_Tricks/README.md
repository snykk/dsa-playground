# Modular Arithmetic Tricks

Essential modular arithmetic techniques for competitive programming.

## Key Concepts

### Basic Operations

```cpp
// Safe modulo (handles negative numbers)
ll mod(ll x, ll m) {
    return ((x % m) + m) % m;
}

// Modular addition, subtraction, multiplication
ll add(ll a, ll b, ll m) { return (a % m + b % m) % m; }
ll sub(ll a, ll b, ll m) { return ((a - b) % m + m) % m; }
ll mul(ll a, ll b, ll m) { return (a % m) * (b % m) % m; }
```

### Fast Exponentiation

```cpp
// O(log n) exponentiation
ll power(ll base, ll exp, ll m) {
    ll result = 1;
    while (exp > 0) {
        if (exp & 1) result = result * base % m;
        base = base * base % m;
        exp >>= 1;
    }
    return result;
}
```

### Modular Inverse

```cpp
// Fermat's Little Theorem: a^(p-1) ≡ 1 (mod p)
// Therefore: a^(-1) ≡ a^(p-2) (mod p)
ll modInverse(ll a, ll m) {
    return power(a, m - 2, m);
}
```

### Precomputed Factorials

```cpp
ll fact[MAXN], invFact[MAXN];

void precompute() {
    fact[0] = 1;
    for (int i = 1; i < MAXN; i++)
        fact[i] = fact[i-1] * i % MOD;
    
    invFact[MAXN-1] = modInverse(fact[MAXN-1]);
    for (int i = MAXN-2; i >= 0; i--)
        invFact[i] = invFact[i+1] * (i+1) % MOD;
}

ll nCr(int n, int r) {
    return fact[n] * invFact[r] % MOD * invFact[n-r] % MOD;
}
```

## Common Tricks

1. **Avoid overflow**: Use `(1LL * a * b) % m` instead of `(a * b) % m`
2. **Negative numbers**: Always use safe mod: `((x % m) + m) % m`
3. **Division**: Multiply by modular inverse instead of dividing
4. **Large exponents**: Use binary exponentiation

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| mod, add, sub, mul | O(1) | O(1) |
| power | O(log n) | O(1) |
| modInverse | O(log m) | O(1) |
| nCr (precomputed) | O(1) | O(n) |
| precompute | O(n) | O(n) |

## Common Moduli

- **10^9 + 7** (1000000007) - Prime, most common
- **998244353** - Prime, NTT-friendly
- **10^9 + 9** (1000000009) - Prime


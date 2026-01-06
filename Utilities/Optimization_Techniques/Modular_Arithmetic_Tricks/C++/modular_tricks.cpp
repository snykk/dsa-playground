/**
 * Modular Arithmetic Tricks for Competitive Programming (C++)
 */

#include <bits/stdc++.h>
using namespace std;

typedef long long ll;
const ll MOD = 1e9 + 7;

// Basic Operations

ll mod(ll x, ll m = MOD) {
    return ((x % m) + m) % m;
}

ll add(ll a, ll b, ll m = MOD) {
    return mod(mod(a, m) + mod(b, m), m);
}

ll sub(ll a, ll b, ll m = MOD) {
    return mod(mod(a, m) - mod(b, m) + m, m);
}

ll mul(ll a, ll b, ll m = MOD) {
    return mod(mod(a, m) * mod(b, m), m);
}

// Fast Exponentiation

ll power(ll base, ll exp, ll m = MOD) {
    ll result = 1;
    base = mod(base, m);
    while (exp > 0) {
        if (exp & 1) result = mul(result, base, m);
        base = mul(base, base, m);
        exp >>= 1;
    }
    return result;
}

// Modular Inverse

// Using Fermat's Little Theorem (when m is prime)
ll modInverse(ll a, ll m = MOD) {
    return power(a, m - 2, m);
}

// Using Extended Euclidean Algorithm (works for any coprime a, m)
ll extGCD(ll a, ll b, ll &x, ll &y) {
    if (b == 0) {
        x = 1; y = 0;
        return a;
    }
    ll x1, y1;
    ll g = extGCD(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

ll modInverseExtGCD(ll a, ll m = MOD) {
    ll x, y;
    ll g = extGCD(a, m, x, y);
    if (g != 1) return -1; // Inverse doesn't exist
    return mod(x, m);
}

ll div_mod(ll a, ll b, ll m = MOD) {
    return mul(a, modInverse(b, m), m);
}

// Precomputed Factorials

const int MAXN = 2e5 + 5;
ll fact[MAXN], invFact[MAXN];

void precompute() {
    fact[0] = 1;
    for (int i = 1; i < MAXN; i++) {
        fact[i] = mul(fact[i-1], i);
    }
    invFact[MAXN-1] = modInverse(fact[MAXN-1]);
    for (int i = MAXN-2; i >= 0; i--) {
        invFact[i] = mul(invFact[i+1], i+1);
    }
}

ll nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return mul(fact[n], mul(invFact[r], invFact[n-r]));
}

ll nPr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return mul(fact[n], invFact[n-r]);
}

// Lucas Theorem (nCr mod p for large n)

ll lucasNCr(ll n, ll r, ll p) {
    if (r == 0) return 1;
    return mul(lucasNCr(n / p, r / p, p), nCr(n % p, r % p), p);
}

// Modular Arithmetic with Negative Numbers

ll safeMod(ll x, ll m = MOD) {
    x %= m;
    if (x < 0) x += m;
    return x;
}

// Multiply without overflow (for very large numbers)

ll mulmod(ll a, ll b, ll m) {
    return (__int128)a * b % m;
}

// Alternative using binary multiplication
ll mulmodSlow(ll a, ll b, ll m) {
    a = safeMod(a, m);
    b = safeMod(b, m);
    ll result = 0;
    while (b > 0) {
        if (b & 1) result = safeMod(result + a, m);
        a = safeMod(a * 2, m);
        b >>= 1;
    }
    return result;
}

int main() {
    precompute();
    
    // Example usage
    cout << "5! mod MOD = " << fact[5] << endl;
    cout << "C(10, 3) = " << nCr(10, 3) << endl;
    cout << "P(10, 3) = " << nPr(10, 3) << endl;
    cout << "2^10 mod MOD = " << power(2, 10) << endl;
    cout << "Inverse of 3 = " << modInverse(3) << endl;
    
    return 0;
}


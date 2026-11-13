// Unit tests for the C++ modular arithmetic helpers.

#ifndef IS_TEST_BUILD
#define IS_TEST_BUILD
#endif
#include <cassert>
#include "modular_tricks.cpp"

static ll exactBinomialMod(int n, int r, ll p) {
    // Pascal's triangle modulo p; small inputs only.
    vector<vector<ll>> c(n + 1, vector<ll>(n + 1, 0));
    for (int i = 0; i <= n; i++) {
        c[i][0] = 1 % p;
        for (int j = 1; j <= i; j++) c[i][j] = (c[i - 1][j - 1] + (j <= i - 1 ? c[i - 1][j] : 0)) % p;
    }
    return c[n][r];
}

void testBasics() {
    assert(mod(-5, MOD) == MOD - 5);
    assert(mod(-5, 3) == 1);
    assert(add(MOD - 1, 5) == 4);
    assert(sub(3, 5) == MOD - 2);
    assert(sub(-3, -5) == 2);
    assert(mul(MOD - 1, MOD - 1) == 1);
    assert(mul(-2, 3, 7) == 1);
}

void testPower() {
    assert(power(2, 10) == 1024);
    assert(power(0, 0, 7) == 1);
    assert(power(3, 0, 7) == 1);
    // pow(2, 100) mod 1e9+7
    assert(power(2, 100) == 976371285LL);
}

void testPowerModulusOne() {
    assert(power(5, 0, 1) == 0);  // used to return 1
    assert(power(5, 3, 1) == 0);
}

void testLargeModulusProducts() {
    // 4e18 / 2 fits, but a plain 64-bit product of two 3e18 values overflows.
    ll m = 4000000000000000037LL;  // a modulus above 2^61
    ll a = 3000000000000000000LL, b = 3000000000000000000LL;
    ll expected = static_cast<ll>(static_cast<__int128>(a) * b % m);
    assert(mul(a, b, m) == expected);
    assert(mulmod(a, b, m) == expected);
    assert(mulmodSlow(a, b, m) == expected);
    assert(power(a, 2, m) == expected);
}

void testInverses() {
    for (ll a : {1LL, 2LL, 3LL, 12345LL, MOD - 1}) {
        assert(mul(a, modInverse(a)) == 1);
        assert(mul(a, modInverseExtGCD(a)) == 1);
    }
    assert(modInverseExtGCD(3, 10) == 7);
    assert(modInverseExtGCD(2, 10) == -1);
    assert(mul(div_mod(7, 3), 3) == 7);
    ll x, y;
    ll g = extGCD(240, 46, x, y);
    assert(g == 2 && 240 * x + 46 * y == 2);
}

void testFactorials() {
    precompute();
    assert(fact[5] == 120);
    assert(nCr(10, 3) == 120);
    assert(nPr(10, 3) == 720);
    assert(nCr(5, 7) == 0);
    assert(nCr(5, -1) == 0);
    assert(nCr(60, 30) == 118264581564861424LL % MOD);
}

void testLucasUsesTheGivenPrime() {
    precompute();  // the global tables are mod 1e9+7; Lucas must not use them
    // used to return 3; C(36, 18) mod 37 is 1
    assert(lucasNCr(36, 18, 37) == 1);
    assert(lucasNCr(36, 18, 37) == exactBinomialMod(36, 18, 37));
}

void testLucasAgainstPascal() {
    const ll primes[] = {2, 3, 5, 7, 11, 13};
    for (ll p : primes) {
        for (int n = 0; n <= 40; n++) {
            vector<vector<ll>> c(n + 1, vector<ll>(n + 1, 0));
            for (int i = 0; i <= n; i++) {
                c[i][0] = 1 % p;
                for (int j = 1; j <= i; j++) c[i][j] = (c[i - 1][j - 1] + (j <= i - 1 ? c[i - 1][j] : 0)) % p;
            }
            for (int r = 0; r <= n; r++) assert(lucasNCr(n, r, p) == c[n][r]);
        }
    }
    assert(lucasNCr(5, 9, 7) == 0);
}

void testSafeMod() {
    assert(safeMod(-1, 7) == 6);
    assert(safeMod(14, 7) == 0);
}

int main() {
    testBasics();
    testPower();
    testPowerModulusOne();
    testLargeModulusProducts();
    testInverses();
    testFactorials();
    testLucasUsesTheGivenPrime();
    testLucasAgainstPascal();
    testSafeMod();
    cout << "All tests passed!" << endl;
    return 0;
}

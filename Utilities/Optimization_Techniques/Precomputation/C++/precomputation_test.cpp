// Unit tests for the C++ precomputation helpers.

#ifndef IS_TEST_BUILD
#define IS_TEST_BUILD
#endif
#include <cassert>
#include "precomputation.cpp"

void testFactorials() {
    precomputeFactorials();
    assert(fact[5] == 120);
    assert(nCr(10, 3) == 120);
    assert(nCr(5, 7) == 0);
    assert(nCr(5, -1) == 0);
    assert(nCr(60, 30) == 118264581564861424LL % MOD);
    assert(fact[10] * invFact[10] % MOD == 1);
}

void testSieve() {
    sieve();
    assert(primes[0] == 2 && primes[1] == 3 && primes[9] == 29);
    assert(isPrime[97] && !isPrime[91] && !isPrime[1] && !isPrime[0]);
    // pi(10000) = 1229
    assert(upper_bound(primes.begin(), primes.end(), 10000) - primes.begin() == 1229);
}

void testSpfAndFactorize() {
    computeSPF();
    assert(spf[12] == 2 && spf[15] == 3 && spf[97] == 97 && spf[1] == 1);
    vector<pair<int, int>> f = factorize(720);
    assert(f.size() == 3);
    assert(f[0] == make_pair(2, 4) && f[1] == make_pair(3, 2) && f[2] == make_pair(5, 1));
    assert(factorize(1).empty());
    assert(factorize(199999).size() >= 1);
}

void testPrefixSum() {
    vector<int> arr = {1, 2, 3, 4, 5};
    buildPrefixSum(arr);
    assert(rangeSum(0, 2) == 6);
    assert(rangeSum(0, 4) == 15);
    assert(rangeSum(3, 3) == 4);
}

void testPrefix2D() {
    vector<vector<int>> grid = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    buildPrefix2D(grid);
    assert(rectSum(0, 0, 2, 2) == 45);
    assert(rectSum(1, 1, 2, 2) == 28);
    assert(rectSum(0, 1, 1, 2) == 16);
    assert(rectSum(2, 0, 2, 0) == 7);
}

void testSparseTable() {
    vector<int> arr = {5, 2, 8, 1, 9, 3, 7};
    buildSparseTable(arr);
    for (int l = 0; l < (int)arr.size(); l++) {
        for (int r = l; r < (int)arr.size(); r++) {
            int expected = *min_element(arr.begin() + l, arr.begin() + r + 1);
            assert(rangeMin(l, r) == expected);
        }
    }
}

void testLca() {
    // 0 -> (1, 2), 1 -> (3, 4), 2 -> 5
    int edges[][2] = {{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}};
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    dfs(0, -1, 0);
    assert(lca(3, 4) == 1);
    assert(lca(3, 5) == 0);
    assert(lca(1, 3) == 1);
    assert(lca(4, 4) == 4);
    assert(lca(5, 0) == 0);
}

void testPow2() {
    precomputePow2();
    assert(pow2[0] == 1 && pow2[10] == 1024 && pow2[62] == (1ULL << 62));
    assert(pow2[63] == 9223372036854775808ULL);  // used to overflow a signed long long
}

int main() {
    testFactorials();
    testSieve();
    testSpfAndFactorize();
    testPrefixSum();
    testPrefix2D();
    testSparseTable();
    testLca();
    testPow2();
    cout << "All tests passed!" << endl;
    return 0;
}

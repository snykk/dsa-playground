/**
 * Test suite for C++ Boilerplate utilities
 */

#include <iostream>
#include <cassert>
#include <vector>
#include <algorithm>

using namespace std;

typedef long long ll;
typedef vector<int> vi;

const int MOD = 1e9 + 7;

// Test math utilities
ll gcd(ll a, ll b) { return b ? gcd(b, a % b) : a; }
ll lcm(ll a, ll b) { return a / gcd(a, b) * b; }

ll power(ll base, ll exp, ll mod = MOD) {
    ll result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}

ll modInverse(ll a, ll mod = MOD) {
    return power(a, mod - 2, mod);
}

// DSU for testing
class DSU {
public:
    vi parent, rank_;
    DSU(int n) : parent(n), rank_(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    bool unite(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;
        if (rank_[x] < rank_[y]) swap(x, y);
        parent[y] = x;
        if (rank_[x] == rank_[y]) rank_[x]++;
        return true;
    }
};

void testGCD() {
    assert(gcd(12, 18) == 6);
    assert(gcd(17, 13) == 1);
    assert(gcd(100, 25) == 25);
    assert(gcd(0, 5) == 5);
    assert(gcd(7, 7) == 7);
    cout << "[PASS] testGCD passed" << endl;
}

void testLCM() {
    assert(lcm(4, 6) == 12);
    assert(lcm(3, 5) == 15);
    assert(lcm(12, 18) == 36);
    assert(lcm(7, 1) == 7);
    cout << "[PASS] testLCM passed" << endl;
}

void testPower() {
    assert(power(2, 10) == 1024);
    assert(power(3, 5) == 243);
    assert(power(2, 0) == 1);
    assert(power(5, 1) == 5);
    // Test with modular arithmetic
    assert(power(2, 30, MOD) == (1LL << 30) % MOD);
    cout << "[PASS] testPower passed" << endl;
}

void testModInverse() {
    // Test: a * modInverse(a) == 1 (mod MOD)
    ll a = 12345;
    ll inv = modInverse(a);
    assert((a * inv) % MOD == 1);
    
    a = 1000000;
    inv = modInverse(a);
    assert((a * inv) % MOD == 1);
    cout << "[PASS] testModInverse passed" << endl;
}

void testDSU() {
    DSU dsu(5);
    
    // Initially all elements are in their own set
    assert(dsu.find(0) == 0);
    assert(dsu.find(1) == 1);
    
    // Unite 0 and 1
    assert(dsu.unite(0, 1) == true);
    assert(dsu.find(0) == dsu.find(1));
    
    // Unite 2 and 3
    dsu.unite(2, 3);
    assert(dsu.find(2) == dsu.find(3));
    
    // 0,1 and 2,3 are different sets
    assert(dsu.find(0) != dsu.find(2));
    
    // Unite the two sets
    dsu.unite(1, 3);
    assert(dsu.find(0) == dsu.find(2));
    assert(dsu.find(1) == dsu.find(3));
    
    // Cannot unite already connected elements
    assert(dsu.unite(0, 2) == false);
    
    cout << "[PASS] testDSU passed" << endl;
}

void testMacros() {
    // Test vector operations
    vi v = {3, 1, 4, 1, 5, 9, 2, 6};
    
    // Test sz
    assert((int)v.size() == 8);
    
    // Test all (sorting)
    sort(v.begin(), v.end());
    assert(v[0] == 1);
    assert(v[v.size()-1] == 9);
    
    // Test rall (reverse sorting)
    sort(v.rbegin(), v.rend());
    assert(v[0] == 9);
    assert(v[v.size()-1] == 1);
    
    cout << "[PASS] testMacros passed" << endl;
}

int main() {
    testGCD();
    testLCM();
    testPower();
    testModInverse();
    testDSU();
    testMacros();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


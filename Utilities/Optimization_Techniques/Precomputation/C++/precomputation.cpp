/**
 * Precomputation Techniques for Competitive Programming (C++)
 */

#include <bits/stdc++.h>
using namespace std;

typedef long long ll;
const int MOD = 1e9 + 7;
const int MAXN = 2e5 + 5;

// Factorial Precomputation

ll fact[MAXN], invFact[MAXN];

ll power(ll base, ll exp, ll mod = MOD) {
    ll result = 1;
    while (exp > 0) {
        if (exp & 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}

void precomputeFactorials() {
    fact[0] = 1;
    for (int i = 1; i < MAXN; i++) {
        fact[i] = fact[i-1] * i % MOD;
    }
    invFact[MAXN-1] = power(fact[MAXN-1], MOD - 2);
    for (int i = MAXN-2; i >= 0; i--) {
        invFact[i] = invFact[i+1] * (i+1) % MOD;
    }
}

ll nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * invFact[r] % MOD * invFact[n-r] % MOD;
}

// Prime Sieve

vector<int> primes;
bool isPrime[MAXN];

void sieve() {
    fill(isPrime, isPrime + MAXN, true);
    isPrime[0] = isPrime[1] = false;
    
    for (int i = 2; i < MAXN; i++) {
        if (isPrime[i]) {
            primes.push_back(i);
            for (int j = 2 * i; j < MAXN; j += i) {
                isPrime[j] = false;
            }
        }
    }
}

// Smallest Prime Factor

int spf[MAXN];  // Smallest Prime Factor

void computeSPF() {
    for (int i = 0; i < MAXN; i++) spf[i] = i;
    
    for (int i = 2; i * i < MAXN; i++) {
        if (spf[i] == i) {  // i is prime
            for (int j = i * i; j < MAXN; j += i) {
                if (spf[j] == j) {
                    spf[j] = i;
                }
            }
        }
    }
}

vector<pair<int, int>> factorize(int n) {
    vector<pair<int, int>> factors;
    while (n > 1) {
        int p = spf[n], cnt = 0;
        while (n % p == 0) {
            n /= p;
            cnt++;
        }
        factors.push_back({p, cnt});
    }
    return factors;
}

// Prefix Sums

vector<ll> prefixSum;

void buildPrefixSum(vector<int>& arr) {
    int n = arr.size();
    prefixSum.resize(n + 1, 0);
    for (int i = 0; i < n; i++) {
        prefixSum[i + 1] = prefixSum[i] + arr[i];
    }
}

ll rangeSum(int l, int r) {
    return prefixSum[r + 1] - prefixSum[l];
}

// 2D Prefix Sums

vector<vector<ll>> prefix2D;

void buildPrefix2D(vector<vector<int>>& grid) {
    int n = grid.size(), m = grid[0].size();
    prefix2D.assign(n + 1, vector<ll>(m + 1, 0));
    
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            prefix2D[i][j] = grid[i-1][j-1] 
                           + prefix2D[i-1][j] 
                           + prefix2D[i][j-1] 
                           - prefix2D[i-1][j-1];
        }
    }
}

ll rectSum(int r1, int c1, int r2, int c2) {
    return prefix2D[r2+1][c2+1] 
         - prefix2D[r1][c2+1] 
         - prefix2D[r2+1][c1] 
         + prefix2D[r1][c1];
}

// Sparse Table (Range Minimum Query)

const int LOG = 20;
int sparse[MAXN][LOG];
int logTable[MAXN];

void buildSparseTable(vector<int>& arr) {
    int n = arr.size();
    
    // Precompute logs
    logTable[1] = 0;
    for (int i = 2; i <= n; i++) {
        logTable[i] = logTable[i/2] + 1;
    }
    
    // Build sparse table
    for (int i = 0; i < n; i++) {
        sparse[i][0] = arr[i];
    }
    
    for (int j = 1; j < LOG; j++) {
        for (int i = 0; i + (1 << j) <= n; i++) {
            sparse[i][j] = min(sparse[i][j-1], sparse[i + (1 << (j-1))][j-1]);
        }
    }
}

int rangeMin(int l, int r) {
    int k = logTable[r - l + 1];
    return min(sparse[l][k], sparse[r - (1 << k) + 1][k]);
}

// LCA Precomputation

const int MAXLOG = 20;
int parent[MAXN][MAXLOG];
int depth[MAXN];
vector<int> adj[MAXN];

void dfs(int u, int p, int d) {
    parent[u][0] = p;
    depth[u] = d;
    
    for (int i = 1; i < MAXLOG; i++) {
        if (parent[u][i-1] != -1) {
            parent[u][i] = parent[parent[u][i-1]][i-1];
        } else {
            parent[u][i] = -1;
        }
    }
    
    for (int v : adj[u]) {
        if (v != p) {
            dfs(v, u, d + 1);
        }
    }
}

int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    
    int diff = depth[u] - depth[v];
    for (int i = 0; i < MAXLOG; i++) {
        if ((diff >> i) & 1) {
            u = parent[u][i];
        }
    }
    
    if (u == v) return u;
    
    for (int i = MAXLOG - 1; i >= 0; i--) {
        if (parent[u][i] != parent[v][i]) {
            u = parent[u][i];
            v = parent[v][i];
        }
    }
    
    return parent[u][0];
}

// Powers of 2

ll pow2[64];

void precomputePow2() {
    pow2[0] = 1;
    for (int i = 1; i < 64; i++) {
        pow2[i] = pow2[i-1] * 2;
    }
}

int main() {
    // Initialize all precomputations
    precomputeFactorials();
    sieve();
    computeSPF();
    precomputePow2();
    
    // Example usage
    cout << "5! = " << fact[5] << endl;
    cout << "C(10, 3) = " << nCr(10, 3) << endl;
    cout << "Number of primes < 100: " << upper_bound(primes.begin(), primes.end(), 100) - primes.begin() << endl;
    cout << "SPF[12] = " << spf[12] << endl;
    cout << "2^10 = " << pow2[10] << endl;
    
    return 0;
}


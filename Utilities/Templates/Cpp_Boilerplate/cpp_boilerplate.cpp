/**
 * C++ Competitive Programming Boilerplate
 * 
 * This template provides a complete starting point for competitive programming
 * with commonly used macros, data types, and utility functions.
 */

#include <bits/stdc++.h>
using namespace std;

// Type Definitions
typedef long long ll;
typedef unsigned long long ull;
typedef long double ld;
typedef pair<int, int> pii;
typedef pair<ll, ll> pll;
typedef vector<int> vi;
typedef vector<ll> vll;
typedef vector<pii> vpii;
typedef vector<pll> vpll;
typedef vector<string> vs;
typedef vector<vector<int>> vvi;
typedef vector<vector<ll>> vvll;

// Macros
#define pb push_back
#define mp make_pair
#define fi first
#define se second
#define all(x) (x).begin(), (x).end()
#define rall(x) (x).rbegin(), (x).rend()
#define sz(x) (int)(x).size()
#define rep(i, a, b) for (int i = (a); i < (b); i++)
#define per(i, a, b) for (int i = (b) - 1; i >= (a); i--)
#define each(x, a) for (auto& x : a)

// Constants
const int MOD = 1e9 + 7;
const int MOD2 = 998244353;
const ll INF = 1e18;
const int IINF = 1e9;
const ld PI = acos(-1.0);
const ld EPS = 1e-9;

// Fast I/O
void fastIO() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
}

// Debug Utilities
#ifdef LOCAL
#define debug(x) cerr << #x << " = " << x << endl
#define debugv(v) cerr << #v << " = ["; for(auto& x : v) cerr << x << " "; cerr << "]" << endl
#else
#define debug(x)
#define debugv(v)
#endif

// Math Utilities
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

// Combinatorics
const int MAXN = 2e5 + 5;
ll fact[MAXN], invFact[MAXN];

void precomputeFactorials() {
    fact[0] = 1;
    for (int i = 1; i < MAXN; i++) {
        fact[i] = fact[i-1] * i % MOD;
    }
    invFact[MAXN-1] = modInverse(fact[MAXN-1]);
    for (int i = MAXN-2; i >= 0; i--) {
        invFact[i] = invFact[i+1] * (i+1) % MOD;
    }
}

ll nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * invFact[r] % MOD * invFact[n-r] % MOD;
}

ll nPr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * invFact[n-r] % MOD;
}

// Graph Utilities
vector<vi> adj;
vi visited;

void dfs(int u) {
    visited[u] = 1;
    for (int v : adj[u]) {
        if (!visited[v]) dfs(v);
    }
}

void bfs(int start, int n) {
    queue<int> q;
    vi dist(n, -1);
    q.push(start);
    dist[start] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
}

// Union Find
class DSU {
public:
    vi parent, rank_;
    DSU(int n) : parent(n), rank_(n, 0) {
        iota(all(parent), 0);
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

// Segment Tree
class SegTree {
    int n;
    vll tree;
public:
    SegTree(int n) : n(n), tree(4 * n, 0) {}
    
    void update(int node, int start, int end, int idx, ll val) {
        if (start == end) {
            tree[node] = val;
        } else {
            int mid = (start + end) / 2;
            if (idx <= mid) update(2*node, start, mid, idx, val);
            else update(2*node+1, mid+1, end, idx, val);
            tree[node] = tree[2*node] + tree[2*node+1];
        }
    }
    
    ll query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        int mid = (start + end) / 2;
        return query(2*node, start, mid, l, r) + query(2*node+1, mid+1, end, l, r);
    }
    
    void update(int idx, ll val) { update(1, 0, n-1, idx, val); }
    ll query(int l, int r) { return query(1, 0, n-1, l, r); }
};

// Main Solution
void solve() {
    // Your solution here
    int n;
    cin >> n;
    
    vi a(n);
    rep(i, 0, n) cin >> a[i];
    
    // Process and output
    ll ans = 0;
    each(x, a) ans += x;
    
    cout << ans << "\n";
}

int main() {
    fastIO();
    
    int t = 1;
    // cin >> t;  // Uncomment for multiple test cases
    
    while (t--) {
        solve();
    }
    
    return 0;
}


#include <cassert>
#include <iostream>
#include <map>
#include <set>
#include "game_theory.cpp"

// Brute-force Nim: true if the player to move wins. piles is kept sorted.
static map<pair<vi, bool>, bool> nimMemo;
static bool bruteNim(vi piles, bool misere) {
    sort(piles.begin(), piles.end());
    int total = 0;
    for (int p : piles) total += p;
    if (total == 0) return misere;  // the previous player took the last object
    auto key = make_pair(piles, misere);
    auto it = nimMemo.find(key);
    if (it != nimMemo.end()) return it->second;
    bool win = false;
    for (size_t i = 0; i < piles.size() && !win; i++) {
        for (int take = 1; take <= piles[i] && !win; take++) {
            vi next = piles;
            next[i] -= take;
            if (!bruteNim(next, misere)) win = true;
        }
    }
    return nimMemo[key] = win;
}

static void forEachPiles(int count, int maxPile, const function<void(vi&)>& fn) {
    vi piles(count, 0);
    while (true) {
        fn(piles);
        int i = 0;
        while (i < count && ++piles[i] > maxPile) piles[i++] = 0;
        if (i == count) break;
    }
}

void testNimAgainstBruteForce() {
    for (int count = 0; count <= 3; count++) {
        forEachPiles(count, 4, [&](vi& p) { assert(nimWinner(p) == bruteNim(p, false)); });
    }
}

void testMisereAgainstBruteForce() {
    for (int count = 0; count <= 4; count++) {
        forEachPiles(count, 3, [&](vi& p) { assert(misereNimWinner(p) == bruteNim(p, true)); });
    }
    vi one = {1}, zeroOne = {0, 1}, zero = {0}, ones3 = {1, 1, 1};
    assert(!misereNimWinner(one));
    assert(!misereNimWinner(zeroOne));  // an empty pile must not count
    assert(misereNimWinner(zero));
    assert(!misereNimWinner(ones3));
}

void testWinningMove() {
    forEachPiles(3, 5, [&](vi& p) {
        auto mv = nimWinningMove(p);
        if (bruteNim(p, false)) {
            assert(mv.first >= 0 && mv.second >= 1 && mv.second <= p[mv.first]);
            vi next = p;
            next[mv.first] -= mv.second;
            assert(!bruteNim(next, false));
        } else {
            assert(mv.first == -1 && mv.second == -1);
        }
    });
}

static map<pair<int, int>, bool> wythoffMemo;
static bool bruteWythoff(int a, int b) {
    if (a == 0 && b == 0) return false;
    auto key = make_pair(a, b);
    auto it = wythoffMemo.find(key);
    if (it != wythoffMemo.end()) return it->second;
    bool win = false;
    for (int t = 1; t <= a && !win; t++) win = !bruteWythoff(a - t, b);
    for (int t = 1; t <= b && !win; t++) win = !bruteWythoff(a, b - t);
    for (int t = 1; t <= min(a, b) && !win; t++) win = !bruteWythoff(a - t, b - t);
    return wythoffMemo[key] = win;
}

void testWythoff() {
    for (int a = 0; a < 30; a++)
        for (int b = 0; b < 30; b++) assert(wythoffWinner(a, b) == bruteWythoff(a, b));
}

void testSubtractionGrundy() {
    vi moves = {1, 2, 3};
    vi g = subtractGrundy(10, moves);
    vi expected = {0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2};
    assert(g == expected);
}

void testStaircase() {
    vi s1 = {5, 3, 0};   // stairs[1] = 3 is non-zero: first player wins
    vi s2 = {5, 0, 7};   // only even stairs hold stones: first player loses
    assert(staircaseNim(s1));
    assert(!staircaseNim(s2));
}

// Brute-force Green Hackenbush on a tree given as parent[] (parent[0] = -1, parent[v] < v).
// State: bitmask of edges still attached to the ground; edge v joins v to parent[v].
static int bruteHackenbush(const vi& parent, unsigned mask, map<unsigned, int>& memo) {
    auto it = memo.find(mask);
    if (it != memo.end()) return it->second;
    int n = parent.size();
    set<int> reach;
    for (int v = 1; v < n; v++) {
        if (!(mask >> v & 1)) continue;
        unsigned next = mask & ~(1u << v);
        for (int u = v + 1; u < n; u++) {  // drop edges whose path to the ground used edge v
            int x = u;
            while (x > v) x = parent[x];
            if (x == v) next &= ~(1u << u);
        }
        reach.insert(bruteHackenbush(parent, next, memo));
    }
    int g = 0;
    while (reach.count(g)) g++;
    return memo[mask] = g;
}

void testHackenbushAgainstBruteForce() {
    unsigned seed = 12345;
    auto rnd = [&]() { seed = seed * 1103515245u + 12345u; return (seed >> 8) & 0xffff; };
    for (int round = 0; round < 200; round++) {
        int n = 1 + rnd() % 9;
        vi parent(n, -1);
        vector<vi> adj(n);
        for (int v = 1; v < n; v++) {
            parent[v] = rnd() % v;
            adj[parent[v]].push_back(v);
            adj[v].push_back(parent[v]);
        }
        map<unsigned, int> memo;
        unsigned full = 0;
        for (int v = 1; v < n; v++) full |= 1u << v;
        assert(hackenbushTree(adj, 0) == bruteHackenbush(parent, full, memo));
    }
    // a path of 2 edges has Grundy value 2 (it used to return the edge-count parity, 0)
    vector<vi> path = {{1}, {0, 2}, {1}};
    assert(hackenbushTree(path, 0) == 2);
}

void testCanWinHasNoSharedMemo() {
    auto takeOne = [](int s) { return s >= 1 ? vi{s - 1} : vi{}; };
    auto takeOneOrTwo = [](int s) {
        vi r;
        for (int t = 1; t <= 2; t++) if (s >= t) r.push_back(s - t);
        return r;
    };
    assert(canWin(3, takeOne));
    assert(!canWin(3, takeOneOrTwo));  // a stale memo from the first game used to return true
    assert(canWin(3, takeOne));
}

void testStoneGame() {
    for (int k = 1; k <= 5; k++) {
        vector<bool> win(31, false);
        for (int i = 1; i <= 30; i++)
            for (int t = 1; t <= min(k, i); t++)
                if (!win[i - t]) win[i] = true;
        for (int n = 0; n <= 30; n++) assert(stoneGameDP(n, k) == win[n]);
    }
}

void testZeckendorf() {
    vi z = zeckendorf(13);
    assert(z.size() == 1 && z[0] == 13);
    for (int n = 0; n < 150; n++) {
        int sum = 0;
        for (int x : zeckendorf(n)) sum += x;
        assert(sum == n);
    }
}

int main() {
    testNimAgainstBruteForce();
    testMisereAgainstBruteForce();
    testWinningMove();
    testWythoff();
    testSubtractionGrundy();
    testStaircase();
    testHackenbushAgainstBruteForce();
    testCanWinHasNoSharedMemo();
    testStoneGame();
    testZeckendorf();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

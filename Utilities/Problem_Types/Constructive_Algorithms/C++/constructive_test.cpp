#include <cassert>
#include <iostream>
#include <set>
#include "constructive.cpp"

static int distinctDiffs(const vi& p) {
    set<int> d;
    for (size_t i = 0; i + 1 < p.size(); i++) d.insert(abs(p[i + 1] - p[i]));
    return (int)d.size();
}

void testPermutationAllSmall() {
    for (int n = 1; n <= 12; n++) {
        for (int k = 0; k <= n + 1; k++) {
            vi perm = constructPermutation(n, k);
            bool valid = (n == 1 && k == 0) || (n >= 2 && k >= 1 && k <= n - 1);
            if (!valid) {
                assert(perm.empty());
                continue;
            }
            vi sorted = perm;
            sort(sorted.begin(), sorted.end());
            for (int i = 0; i < n; i++) assert(sorted[i] == i + 1);
            assert(distinctDiffs(perm) == k);
        }
    }
    vi expected = {1, 4, 2, 3, 5};
    assert(constructPermutation(5, 3) == expected);
}

void testArrayWithSum() {
    vi arr = constructArrayWithSum(5, 15, 1, 5);
    int sum = 0;
    for (int x : arr) sum += x;
    assert(sum == 15);
    assert(constructArrayWithSum(3, 2, 1, 5).empty());
    assert(constructArrayWithSum(3, 16, 1, 5).empty());
}

void testGraph() {
    vi degrees = {2, 2, 2};
    auto edges = constructGraph(degrees);
    assert(edges.size() == 3);
    vi got(3, 0);
    for (auto& e : edges) {
        got[e.first]++;
        got[e.second]++;
    }
    assert(got == degrees);
    vi bad = {3, 1, 1};
    assert(constructGraph(bad).empty());
}

void testString() {
    string s = constructString(6, 3, 3);
    assert((int)s.size() == 6);
    for (size_t i = 0; i + 1 < s.size(); i++) assert(s[i] != s[i + 1]);
    assert(constructString(5, 1, 1).empty());  // counts must add up to n
    assert(constructString(1, 1, 1).empty());
    assert(constructString(3, 3, 0).empty());
}

void testDecomposition() {
    vi expected = {1, 4, 8};
    assert(constructByDecomposition(13) == expected);
    assert(constructByDecomposition(0).empty());
    vi high = {1, 1 << 30};
    assert(constructByDecomposition((1 << 30) + 1) == high);
    vi top = {1 << 30};
    assert(constructByDecomposition(1 << 30) == top);
}

void testMatrixKeepsInput() {
    vi rows = {3, 2}, cols = {1, 4};
    auto m = constructMatrix(rows, cols);
    assert(rows == vi({3, 2}) && cols == vi({1, 4}));
    assert(m[0][0] + m[0][1] == 3 && m[1][0] + m[1][1] == 2);
    assert(m[0][0] + m[1][0] == 1 && m[0][1] + m[1][1] == 4);
    vi r2 = {1}, c2 = {2};
    assert(constructMatrix(r2, c2).empty());
}

void testGreedy() {
    vi c = {2, 1, 3};
    vi expected = {2, 1, 3};
    assert(greedyConstruction(4, c) == expected);
    vi bad = {2, 2, 2};
    assert(greedyConstruction(3, bad).empty());
}

int main() {
    testPermutationAllSmall();
    testArrayWithSum();
    testGraph();
    testString();
    testDecomposition();
    testMatrixKeepsInput();
    testGreedy();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

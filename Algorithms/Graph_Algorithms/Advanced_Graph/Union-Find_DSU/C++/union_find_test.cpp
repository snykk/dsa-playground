/**
 * Test cases for Union-Find (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "union_find.cpp"

void testBasicUnionFind() {
    UnionFind uf(5);
    
    assert(uf.getCount() == 5);
    assert(!uf.connected(0, 1));
    
    assert(uf.unite(0, 1));
    assert(uf.getCount() == 4);
    assert(uf.connected(0, 1));
    
    assert(uf.unite(2, 3));
    assert(uf.getCount() == 3);
    assert(uf.connected(2, 3));
    
    assert(uf.unite(1, 2));
    assert(uf.getCount() == 2);
    assert(uf.connected(0, 3));
    
    std::cout << "Basic Union-Find test passed" << std::endl;
}

void testCycleDetection() {
    std::vector<std::pair<int, int>> edges = {{0, 1}, {1, 2}, {2, 0}};
    bool hasCycle = unionFindCycleDetection(edges, 3);
    assert(hasCycle);
    
    std::vector<std::pair<int, int>> noCycle = {{0, 1}, {1, 2}};
    hasCycle = unionFindCycleDetection(noCycle, 3);
    assert(!hasCycle);
    
    std::cout << "Cycle detection test passed" << std::endl;
}

// The trace from the README: eight singletons merged pairwise end in one set.
void testPairwiseMerges() {
    UnionFind uf(8);
    int pairs[7][2] = {{0, 1}, {2, 3}, {0, 2}, {4, 5}, {6, 7}, {4, 6}, {0, 4}};
    for (auto& p : pairs) assert(uf.unite(p[0], p[1]));
    assert(uf.getCount() == 1);
    for (int i = 1; i < 8; ++i) assert(uf.connected(0, i));
    assert(!uf.unite(3, 7));
    assert(uf.getCount() == 1);
    std::cout << "Pairwise merges test passed" << std::endl;
}

// Union by rank keeps trees shallow, so the recursive find is safe on a long chain.
void testLongChain() {
    const int n = 1000000;
    UnionFind uf(n);
    for (int i = 0; i + 1 < n; ++i) uf.unite(i, i + 1);
    assert(uf.getCount() == 1);
    assert(uf.connected(0, n - 1));
    std::cout << "Long chain test passed" << std::endl;
}

int main() {
    std::cout << "Running Union-Find tests..." << std::endl;
    testBasicUnionFind();
    testCycleDetection();
    testPairwiseMerges();
    testLongChain();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}


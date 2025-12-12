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
    
    std::cout << "✓ Basic Union-Find test passed" << std::endl;
}

void testCycleDetection() {
    std::vector<std::pair<int, int>> edges = {{0, 1}, {1, 2}, {2, 0}};
    bool hasCycle = unionFindCycleDetection(edges, 3);
    assert(hasCycle);
    
    std::vector<std::pair<int, int>> noCycle = {{0, 1}, {1, 2}};
    hasCycle = unionFindCycleDetection(noCycle, 3);
    assert(!hasCycle);
    
    std::cout << "✓ Cycle detection test passed" << std::endl;
}

int main() {
    std::cout << "Running Union-Find tests..." << std::endl;
    testBasicUnionFind();
    testCycleDetection();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}


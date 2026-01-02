#include <iostream>
#include <cassert>
#include "union_find.cpp" // Including implementation for test simplicity

void testUnionFind() {
    UnionFind uf(5);
    
    assert(uf.getCount() == 5);
    
    assert(uf.unite(0, 1) == true);
    assert(uf.unite(0, 1) == false); // Already connected
    
    assert(uf.connected(0, 1) == true);
    assert(uf.connected(0, 2) == false);
    
    uf.unite(1, 2);
    assert(uf.connected(0, 2) == true); // Transitive
    
    assert(uf.getCount() == 3); // Sets: {0,1,2}, {3}, {4}
    
    std::cout << "UnionFind basic tests passed!" << std::endl;
}

void testLargeUnion() {
    int n = 100;
    UnionFind uf(n);
    
    for (int i = 0; i < n - 1; ++i) {
        uf.unite(i, i + 1);
    }
    
    assert(uf.getCount() == 1);
    assert(uf.connected(0, 99) == true);
    
    std::cout << "Large Union tests passed!" << std::endl;
}

int main() {
    testUnionFind();
    testLargeUnion();
    
    std::cout << "All tests passed successfully!" << std::endl;
    return 0;
}

/**
 * Test suite for Disjoint Set Union (DSU) data structure (C++)
 */

#include <iostream>
#include <cassert>
#include <algorithm>
#include <stdexcept>
#include "dsu.cpp"

void testInitialization() {
    DSU dsu(5);
    assert(dsu.getComponentCount() == 5);
    for (int i = 0; i < 5; i++) {
        assert(dsu.find(i) == i);
        assert(dsu.getSize(i) == 1);
    }
    std::cout << "  [PASS] Initialization" << std::endl;
}

void testSingleElement() {
    DSU dsu(1);
    assert(dsu.getComponentCount() == 1);
    assert(dsu.find(0) == 0);
    assert(dsu.getSize(0) == 1);
    std::cout << "  [PASS] Single element" << std::endl;
}

void testUnionTwoElements() {
    DSU dsu(5);
    bool merged = dsu.unite(0, 1);
    assert(merged);
    assert(dsu.getComponentCount() == 4);
    assert(dsu.connected(0, 1));
    assert(dsu.getSize(0) == 2);
    assert(dsu.getSize(1) == 2);
    std::cout << "  [PASS] Union two elements" << std::endl;
}

void testUnionAlreadySameSet() {
    DSU dsu(5);
    dsu.unite(0, 1);
    bool merged = dsu.unite(0, 1);
    assert(!merged);
    assert(dsu.getComponentCount() == 4);
    std::cout << "  [PASS] Union already same set" << std::endl;
}

void testMultipleUnionsLargerSet() {
    DSU dsu(6);
    dsu.unite(0, 1);
    dsu.unite(2, 3);
    dsu.unite(1, 3);
    assert(dsu.connected(0, 2));
    assert(dsu.connected(0, 3));
    assert(dsu.connected(1, 2));
    assert(dsu.getComponentCount() == 3);
    assert(dsu.getSize(0) == 4);
    std::cout << "  [PASS] Multiple unions forming larger set" << std::endl;
}

void testAllInOneSet() {
    DSU dsu(4);
    dsu.unite(0, 1);
    dsu.unite(1, 2);
    dsu.unite(2, 3);
    assert(dsu.getComponentCount() == 1);
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            assert(dsu.connected(i, j));
        }
    }
    assert(dsu.getSize(0) == 4);
    std::cout << "  [PASS] All in one set" << std::endl;
}

void testPathCompression() {
    DSU dsu(5);
    // union by rank: {0,1} and {2,3}, then roots 0 and 2 -> 2 hangs under 0
    dsu.unite(0, 1);
    dsu.unite(2, 3);
    dsu.unite(0, 2);
    // 3 is a grandchild of the root, so it is not flat yet
    assert(dsu.getParent(3) == 2);
    assert(dsu.find(3) == 0);
    // after find, 3 points directly to the root
    assert(dsu.getParent(3) == 0);
    std::cout << "  [PASS] Path compression" << std::endl;
}

void testOutOfRange() {
    DSU dsu(3);
    bool threw = false;
    try { dsu.find(-1); } catch (const std::out_of_range&) { threw = true; }
    assert(threw);
    threw = false;
    try { dsu.find(3); } catch (const std::out_of_range&) { threw = true; }
    assert(threw);
    threw = false;
    try { DSU bad(-2); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    std::cout << "  [PASS] Out-of-range elements rejected" << std::endl;
}

void testConnected() {
    DSU dsu(3);
    assert(!dsu.connected(0, 1));
    assert(!dsu.connected(1, 2));
    assert(dsu.connected(0, 0));

    dsu.unite(0, 2);
    assert(dsu.connected(0, 2));
    assert(!dsu.connected(0, 1));
    std::cout << "  [PASS] Connected queries" << std::endl;
}

void testComponentCountDecreases() {
    DSU dsu(5);
    assert(dsu.getComponentCount() == 5);
    dsu.unite(0, 1);
    assert(dsu.getComponentCount() == 4);
    dsu.unite(2, 3);
    assert(dsu.getComponentCount() == 3);
    dsu.unite(0, 2);
    assert(dsu.getComponentCount() == 2);
    dsu.unite(0, 4);
    assert(dsu.getComponentCount() == 1);

    // Redundant union should not change count
    dsu.unite(1, 3);
    assert(dsu.getComponentCount() == 1);
    std::cout << "  [PASS] Component count decreases" << std::endl;
}

void testGetComponents() {
    DSU dsu(5);
    dsu.unite(0, 1);
    dsu.unite(2, 3);
    auto components = dsu.getComponents();
    assert((int)components.size() == 3);

    // Collect sizes and sort
    std::vector<int> sizes;
    for (auto& pair : components) {
        sizes.push_back((int)pair.second.size());
    }
    std::sort(sizes.begin(), sizes.end());
    assert(sizes[0] == 1);
    assert(sizes[1] == 2);
    assert(sizes[2] == 2);
    std::cout << "  [PASS] Get components" << std::endl;
}

void testGetComponentsSingleComponent() {
    DSU dsu(3);
    dsu.unite(0, 1);
    dsu.unite(1, 2);
    auto components = dsu.getComponents();
    assert((int)components.size() == 1);
    auto& members = components.begin()->second;
    std::sort(members.begin(), members.end());
    assert(members.size() == 3);
    assert(members[0] == 0 && members[1] == 1 && members[2] == 2);
    std::cout << "  [PASS] Get components (single component)" << std::endl;
}

void testGetSize() {
    DSU dsu(5);
    dsu.unite(0, 1);
    assert(dsu.getSize(0) == 2);
    assert(dsu.getSize(1) == 2);

    dsu.unite(2, 3);
    dsu.unite(0, 2);
    assert(dsu.getSize(0) == 4);
    assert(dsu.getSize(3) == 4);
    assert(dsu.getSize(4) == 1);
    std::cout << "  [PASS] Get size" << std::endl;
}

int main() {
    std::cout << "Running DSU tests..." << std::endl;
    testInitialization();
    testSingleElement();
    testUnionTwoElements();
    testUnionAlreadySameSet();
    testMultipleUnionsLargerSet();
    testAllInOneSet();
    testPathCompression();
    testOutOfRange();
    testConnected();
    testComponentCountDecreases();
    testGetComponents();
    testGetComponentsSingleComponent();
    testGetSize();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}

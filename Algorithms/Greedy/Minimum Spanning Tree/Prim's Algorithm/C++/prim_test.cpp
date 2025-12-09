/**
 * Test cases for Prim's Algorithm (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "prim.cpp"

void testSimpleGraph() {
    std::vector<std::vector<std::pair<int, int>>> graph = {
        {{1, 10}, {2, 6}, {3, 5}},
        {{0, 10}, {3, 15}},
        {{0, 6}, {3, 4}},
        {{0, 5}, {1, 15}, {2, 4}}
    };
    auto mst = primMST(graph, 0);
    assert(mst.size() == 3);
    std::cout << "✓ Simple graph test passed" << std::endl;
}

int main() {
    std::cout << "Running Prim's Algorithm tests..." << std::endl;
    testSimpleGraph();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}


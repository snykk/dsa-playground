/**
 * Test cases for Kruskal's Algorithm (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "kruskal.cpp"

void testSimpleGraph() {
    std::vector<std::tuple<int, int, int>> edges = {
        {0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}
    };
    auto mst = kruskalMST(edges, 4);
    assert(mst.size() == 3);
    std::cout << "✓ Simple graph test passed" << std::endl;
}

int main() {
    std::cout << "Running Kruskal's Algorithm tests..." << std::endl;
    testSimpleGraph();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}


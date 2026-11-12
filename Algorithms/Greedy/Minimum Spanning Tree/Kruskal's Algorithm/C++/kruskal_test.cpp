/**
 * Test cases for Kruskal's Algorithm (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "kruskal.cpp"

using Edges = std::vector<std::tuple<int, int, int>>;

static int totalWeight(const Edges& mst) {
    int total = 0;
    for (const auto& edge : mst) {
        total += std::get<2>(edge);
    }
    return total;
}

void testSimpleGraph() {
    Edges edges = {
        {0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}
    };
    auto mst = kruskalMST(edges, 4);
    assert(mst.size() == 3);
    assert(totalWeight(mst) == 19);
    std::cout << "[ok] Simple graph test passed" << std::endl;
}

void testDisconnectedGivesSpanningForest() {
    Edges edges = {{0, 1, 5}, {2, 3, 3}};
    auto mst = kruskalMST(edges, 4);
    assert(mst.size() == 2);
    assert(totalWeight(mst) == 8);
    std::cout << "[ok] Disconnected graph test passed" << std::endl;
}

void testNegativeWeights() {
    Edges edges = {{0, 1, -2}, {0, 2, 7}, {1, 2, 3}, {1, 3, -5}, {2, 3, 1}};
    auto mst = kruskalMST(edges, 4);
    assert(mst.size() == 3);
    assert(totalWeight(mst) == -6);
    std::cout << "[ok] Negative weights test passed" << std::endl;
}

void testEmptyAndSingleVertex() {
    Edges none;
    assert(kruskalMST(none, 0).empty());
    assert(kruskalMST(none, 1).empty());
    std::cout << "[ok] Empty and single vertex test passed" << std::endl;
}

int main() {
    std::cout << "Running Kruskal's Algorithm tests..." << std::endl;
    testSimpleGraph();
    testDisconnectedGivesSpanningForest();
    testNegativeWeights();
    testEmptyAndSingleVertex();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}

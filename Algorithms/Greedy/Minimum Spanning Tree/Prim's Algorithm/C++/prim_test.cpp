/**
 * Test cases for Prim's Algorithm (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "prim.cpp"

using Graph = std::vector<std::vector<std::pair<int, int>>>;

static int totalWeight(const std::vector<std::tuple<int, int, int>>& mst) {
    int total = 0;
    for (const auto& edge : mst) {
        total += std::get<2>(edge);
    }
    return total;
}

void testSimpleGraph() {
    Graph graph = {
        {{1, 10}, {2, 6}, {3, 5}},
        {{0, 10}, {3, 15}},
        {{0, 6}, {3, 4}},
        {{0, 5}, {1, 15}, {2, 4}}
    };
    auto mst = primMST(graph, 0);
    assert(mst.size() == 3);
    assert(totalWeight(mst) == 19);
    std::cout << "[ok] Simple graph test passed" << std::endl;
}

void testDisconnectedCoversStartComponentOnly() {
    Graph graph = {{{1, 1}}, {{0, 1}}, {{3, 1}}, {{2, 1}}};
    auto mst = primMST(graph, 0);
    assert(mst.size() == 1);
    assert(totalWeight(mst) == 1);
    std::cout << "[ok] Disconnected graph test passed" << std::endl;
}

void testNegativeWeights() {
    Graph graph = {
        {{1, -2}, {2, 7}},
        {{0, -2}, {2, 3}, {3, -5}},
        {{0, 7}, {1, 3}, {3, 1}},
        {{1, -5}, {2, 1}}
    };
    auto mst = primMST(graph, 0);
    assert(mst.size() == 3);
    assert(totalWeight(mst) == -6);
    std::cout << "[ok] Negative weights test passed" << std::endl;
}

void testEmptyAndSingleVertex() {
    assert(primMST(Graph{}, 0).empty());
    assert(primMST(Graph{{}}, 0).empty());
    std::cout << "[ok] Empty and single vertex test passed" << std::endl;
}

int main() {
    std::cout << "Running Prim's Algorithm tests..." << std::endl;
    testSimpleGraph();
    testDisconnectedCoversStartComponentOnly();
    testNegativeWeights();
    testEmptyAndSingleVertex();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}

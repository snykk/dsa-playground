/**
 * Test cases for Kosaraju's Algorithm (C++)
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <cassert>
#include "kosaraju.cpp"

void testBasicKosaraju() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}},
        {4, {5}},
        {5, {6}},
        {6, {4}}
    };
    
    auto sccs = kosarajuSCC(graph);
    assert(sccs.size() == 2);  // Two SCCs
    
    std::cout << "Basic Kosaraju test passed" << std::endl;
}

// The condensation of this graph is a chain {0,1,2} -> {3,4} -> {5}. Kosaraju emits
// components source first, so the order is deterministic here.
void testComponentContents() {
    std::unordered_map<int, std::vector<int>> graph = {
        {0, {1}}, {1, {2}}, {2, {0, 3}}, {3, {4}}, {4, {3, 5}}, {5, {}}
    };
    auto sccs = kosarajuSCC(graph);
    assert(sccs.size() == 3);
    std::vector<std::vector<int>> expected = {{0, 1, 2}, {3, 4}, {5}};
    for (auto& c : sccs) std::sort(c.begin(), c.end());
    assert(sccs == expected);

    std::unordered_map<int, std::vector<int>> selfLoop = {{7, {7}}};
    assert(kosarajuSCCCount(selfLoop) == 1);

    std::cout << "Component contents test passed" << std::endl;
}

void testStronglyConnected() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}}
    };
    
    assert(isStronglyConnected(graph));
    assert(kosarajuSCCCount(graph) == 1);
    
    std::cout << "Strongly connected test passed" << std::endl;
}

// Components as sorted lists, in sorted order, so results can be compared exactly.
std::vector<std::vector<int>> normalized(std::vector<std::vector<int>> sccs) {
    for (auto& c : sccs) std::sort(c.begin(), c.end());
    std::sort(sccs.begin(), sccs.end());
    return sccs;
}

// Regression: visited was a vector<bool> sized by the largest id, so negative ids
// indexed out of bounds.
void testNegativeIdsAndNeighborOnlyVertices() {
    std::unordered_map<int, std::vector<int>> graph = {{-1, {0}}, {0, {-1, 7}}};
    std::vector<std::vector<int>> expected = {{-1, 0}, {7}};
    assert(normalized(kosarajuSCC(graph)) == expected);

    std::unordered_map<int, std::vector<int>> sinkNotAKey = {{0, {1}}};
    std::vector<std::vector<int>> twoSingletons = {{0}, {1}};
    assert(normalized(kosarajuSCC(sinkNotAKey)) == twoSingletons);

    std::cout << "Negative ids / neighbor-only vertices test passed" << std::endl;
}

// Regression: the recursive DFS overflowed the call stack on a 10^6-vertex cycle.
void testDeepGraphs() {
    const int n = 1000000;
    std::unordered_map<int, std::vector<int>> cycle;
    for (int i = 0; i < n; ++i) cycle[i] = {(i + 1) % n};
    auto sccs = kosarajuSCC(cycle);
    assert(sccs.size() == 1 && static_cast<int>(sccs[0].size()) == n);

    std::unordered_map<int, std::vector<int>> path;
    for (int i = 0; i < n; ++i) path[i] = {i + 1};
    assert(kosarajuSCCCount(path) == n + 1);

    std::cout << "Deep cycle / path test passed" << std::endl;
}

int main() {
    std::cout << "Running Kosaraju's Algorithm tests..." << std::endl;
    testBasicKosaraju();
    testComponentContents();
    testStronglyConnected();
    testNegativeIdsAndNeighborOnlyVertices();
    testDeepGraphs();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}


/**
 * Test cases for Tarjan's Algorithm (C++)
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <cassert>
#include "tarjan.cpp"

void testBasicTarjan() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}},
        {4, {5}},
        {5, {6}},
        {6, {4}}
    };
    
    auto sccs = tarjanSCC(graph);
    assert(sccs.size() == 2);  // Two SCCs
    
    std::cout << "Basic Tarjan test passed" << std::endl;
}

// Components come out sinks first: {5}, then {3,4}, then {0,1,2}. The order of the
// vertices inside one component is the stack pop order, so compare them sorted.
void testComponentContentsAndOrder() {
    std::unordered_map<int, std::vector<int>> graph = {
        {0, {1}}, {1, {2}}, {2, {0, 3}}, {3, {4}}, {4, {3, 5}}, {5, {}}
    };
    auto sccs = tarjanSCC(graph);
    assert(sccs.size() == 3);
    for (auto& c : sccs) std::sort(c.begin(), c.end());
    std::vector<std::vector<int>> expected = {{5}, {3, 4}, {0, 1, 2}};
    assert(sccs == expected);

    std::unordered_map<int, std::vector<int>> selfLoop = {{7, {7}}};
    assert(tarjanSCCCount(selfLoop) == 1);

    std::cout << "Component contents and order test passed" << std::endl;
}

void testStronglyConnected() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}}
    };
    
    assert(isStronglyConnected(graph));
    assert(tarjanSCCCount(graph) == 1);
    
    std::cout << "Strongly connected test passed" << std::endl;
}

// Regression: onStack was a vector<bool> sized by the largest id, so negative ids
// indexed out of bounds.
void testNegativeIdsAndNeighborOnlyVertices() {
    std::unordered_map<int, std::vector<int>> graph = {{-1, {0}}, {0, {-1, 7}}};
    auto sccs = tarjanSCC(graph);
    // SCCs come out in reverse topological order: the sink {7} first.
    assert(sccs.size() == 2);
    assert(sccs[0] == std::vector<int>{7});
    std::vector<int> big = sccs[1];
    std::sort(big.begin(), big.end());
    assert((big == std::vector<int>{-1, 0}));

    std::cout << "Negative ids / neighbor-only vertices test passed" << std::endl;
}

// Regression: the recursive strongConnect overflowed the call stack on a
// 10^6-vertex cycle.
void testDeepGraphs() {
    const int n = 1000000;
    std::unordered_map<int, std::vector<int>> cycle;
    for (int i = 0; i < n; ++i) cycle[i] = {(i + 1) % n};
    auto sccs = tarjanSCC(cycle);
    assert(sccs.size() == 1 && static_cast<int>(sccs[0].size()) == n);

    std::unordered_map<int, std::vector<int>> path;
    for (int i = 0; i < n; ++i) path[i] = {i + 1};
    assert(tarjanSCCCount(path) == n + 1);

    std::cout << "Deep cycle / path test passed" << std::endl;
}

int main() {
    std::cout << "Running Tarjan's Algorithm tests..." << std::endl;
    testBasicTarjan();
    testComponentContentsAndOrder();
    testStronglyConnected();
    testNegativeIdsAndNeighborOnlyVertices();
    testDeepGraphs();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}


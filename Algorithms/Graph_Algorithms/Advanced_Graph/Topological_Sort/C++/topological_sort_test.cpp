/**
 * Test cases for Topological Sort (C++)
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <cassert>
#include "topological_sort.cpp"

void testBasicTopologicalSort() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    auto result = topologicalSortKahn(graph);
    assert(!result.empty());
    assert(result.size() == 4);
    
    // Check ordering: 1 before 2 and 4, 2 before 3
    auto it1 = std::find(result.begin(), result.end(), 1);
    auto it2 = std::find(result.begin(), result.end(), 2);
    auto it4 = std::find(result.begin(), result.end(), 4);
    auto it3 = std::find(result.begin(), result.end(), 3);
    
    assert(it1 < it2);
    assert(it1 < it4);
    assert(it2 < it3);
    
    std::cout << "Basic topological sort test passed" << std::endl;
}

void testCycleDetection() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}}  // Cycle
    };
    
    auto result = topologicalSortKahn(graph);
    assert(result.empty() || result.size() != graph.size());
    
    std::cout << "Cycle detection test passed" << std::endl;
}

void testIsDAG() {
    std::unordered_map<int, std::vector<int>> dag = {
        {1, {2}},
        {2, {3}},
        {3, {}}
    };
    assert(isDAG(dag));
    
    std::unordered_map<int, std::vector<int>> cycle = {
        {1, {2}},
        {2, {1}}
    };
    assert(!isDAG(cycle));
    
    std::cout << "Is DAG test passed" << std::endl;
}

// Regression: isDAG compared the order length with graph.size(), which counts
// keys only, and treated an empty order as a cycle.
void testIsDAGEmptyAndNeighborOnlyVertices() {
    assert(isDAG({}));

    std::unordered_map<int, std::vector<int>> sinkNotAKey = {{0, {1}}};
    assert(topologicalSortKahn(sinkNotAKey).size() == 2);
    assert(isDAG(sinkNotAKey));

    std::unordered_map<int, std::vector<int>> diamond = {{0, {1, 2}}, {1, {3}}, {2, {3}}};
    assert(topologicalSortKahn(diamond).size() == 4);
    assert(isDAG(diamond));

    std::unordered_map<int, std::vector<int>> cycleWithTail = {{0, {1}}, {1, {0, 2}}};
    assert(topologicalSortKahn(cycleWithTail).empty());
    assert(!isDAG(cycleWithTail));

    std::unordered_map<int, std::vector<int>> selfLoop = {{0, {0}}};
    assert(!isDAG(selfLoop));

    std::cout << "Is DAG empty / neighbor-only vertices test passed" << std::endl;
}

// Every edge u -> v must have u before v, and every vertex (including the
// neighbor-only vertex 4) must appear exactly once.
void testOrderIsValid() {
    std::unordered_map<int, std::vector<int>> graph = {
        {0, {1, 2}}, {1, {3}}, {2, {3}}, {3, {4}}, {5, {4}}
    };
    auto order = topologicalSortKahn(graph);
    assert(order.size() == 6);
    std::unordered_map<int, int> pos;
    for (int i = 0; i < static_cast<int>(order.size()); ++i) pos[order[i]] = i;
    assert(pos.size() == 6);
    for (const auto& pair : graph) {
        for (int v : pair.second) assert(pos[pair.first] < pos[v]);
    }
    std::cout << "Order is valid test passed" << std::endl;
}

// Kahn's algorithm is iterative, so a long chain is fine.
void testLongChain() {
    const int n = 1000000;
    std::unordered_map<int, std::vector<int>> chain;
    for (int i = 0; i < n; ++i) chain[i] = {i + 1};
    auto order = topologicalSortKahn(chain);
    assert(static_cast<int>(order.size()) == n + 1);
    assert(order.front() == 0 && order.back() == n);
    std::cout << "Long chain test passed" << std::endl;
}

int main() {
    std::cout << "Running Topological Sort tests..." << std::endl;
    testBasicTopologicalSort();
    testCycleDetection();
    testIsDAG();
    testIsDAGEmptyAndNeighborOnlyVertices();
    testOrderIsValid();
    testLongChain();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}


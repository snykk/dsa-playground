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
    
    std::cout << "✓ Basic topological sort test passed" << std::endl;
}

void testCycleDetection() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}}  // Cycle
    };
    
    auto result = topologicalSortKahn(graph);
    assert(result.empty() || result.size() != graph.size());
    
    std::cout << "✓ Cycle detection test passed" << std::endl;
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
    
    std::cout << "✓ Is DAG test passed" << std::endl;
}

int main() {
    std::cout << "Running Topological Sort tests..." << std::endl;
    testBasicTopologicalSort();
    testCycleDetection();
    testIsDAG();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}


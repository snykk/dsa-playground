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
    
    std::cout << "✓ Basic Tarjan test passed" << std::endl;
}

void testStronglyConnected() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}}
    };
    
    assert(isStronglyConnected(graph));
    assert(tarjanSCCCount(graph) == 1);
    
    std::cout << "✓ Strongly connected test passed" << std::endl;
}

int main() {
    std::cout << "Running Tarjan's Algorithm tests..." << std::endl;
    testBasicTarjan();
    testStronglyConnected();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}


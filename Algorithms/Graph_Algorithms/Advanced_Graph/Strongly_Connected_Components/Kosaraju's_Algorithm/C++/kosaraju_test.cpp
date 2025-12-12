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
    
    std::cout << "✓ Basic Kosaraju test passed" << std::endl;
}

void testStronglyConnected() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}}
    };
    
    assert(isStronglyConnected(graph));
    assert(kosarajuSCCCount(graph) == 1);
    
    std::cout << "✓ Strongly connected test passed" << std::endl;
}

int main() {
    std::cout << "Running Kosaraju's Algorithm tests..." << std::endl;
    testBasicKosaraju();
    testStronglyConnected();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}


#include <iostream>
#include <unordered_map>
#include <cassert>
#include "ford_fulkerson.cpp"

int main() {
    std::unordered_map<int, std::unordered_map<int, int>> graph = {
        {0, {{1, 16}, {2, 13}}},
        {1, {{2, 10}, {3, 12}}},
        {2, {{1, 4}, {4, 14}}},
        {3, {{2, 9}, {5, 20}}},
        {4, {{3, 7}, {5, 4}}}
    };
    
    int maxFlow = fordFulkerson(graph, 0, 5);
    assert(maxFlow == 23);
    
    std::cout << "✓ Ford-Fulkerson test passed" << std::endl;
    return 0;
}


/**
 * Test suite for DFS implementation
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <cassert>
#include "dfs.cpp"

using namespace std;

void testDfsAdjacencyList() {
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    vector<int> result = dfsAdjacencyList(graph, 1);
    
    assert(result.size() == 4);
    assert(result[0] == 1);
    assert(find(result.begin(), result.end(), 2) != result.end());
    assert(find(result.begin(), result.end(), 3) != result.end());
    assert(find(result.begin(), result.end(), 4) != result.end());
    
    cout << "✓ testDfsAdjacencyList passed" << endl;
}

void testDfsWithPath() {
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    vector<int> path = dfsWithPath(graph, 1, 3);
    
    assert(!path.empty());
    assert(path[0] == 1);
    assert(path.back() == 3);
    
    cout << "✓ testDfsWithPath passed" << endl;
}

void testDfsDetectCycle() {
    unordered_map<int, vector<int>> cyclicGraph = {
        {1, {2}},
        {2, {3}},
        {3, {1}}
    };
    
    bool hasCycle = dfsDetectCycle(cyclicGraph, true);
    assert(hasCycle);
    
    unordered_map<int, vector<int>> acyclicGraph = {
        {1, {2}},
        {2, {3}},
        {3, {}}
    };
    
    hasCycle = dfsDetectCycle(acyclicGraph, true);
    assert(!hasCycle);
    
    cout << "✓ testDfsDetectCycle passed" << endl;
}

int main() {
    testDfsAdjacencyList();
    testDfsWithPath();
    testDfsDetectCycle();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


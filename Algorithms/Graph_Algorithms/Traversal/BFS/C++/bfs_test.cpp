/**
 * Test suite for BFS implementation
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <cassert>
#include "bfs.cpp"

using namespace std;

void testBfsAdjacencyList() {
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    vector<int> result = bfsAdjacencyList(graph, 1);
    vector<int> expected = {1, 2, 4, 3};
    
    assert(result == expected);
    cout << "✓ testBfsAdjacencyList passed" << endl;
}

void testBfsWithPath() {
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    vector<int> path = bfsWithPath(graph, 1, 3);
    vector<int> expected = {1, 2, 3};
    
    assert(path == expected);
    cout << "✓ testBfsWithPath passed" << endl;
}

void testBfsLevelOrder() {
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    vector<vector<int>> levels = bfsLevelOrder(graph, 1);
    
    assert(levels.size() == 3);
    assert(levels[0] == vector<int>{1});
    assert(find(levels[1].begin(), levels[1].end(), 2) != levels[1].end());
    assert(find(levels[1].begin(), levels[1].end(), 4) != levels[1].end());
    assert(levels[2] == vector<int>{3});
    
    cout << "✓ testBfsLevelOrder passed" << endl;
}

void testBfsShortestDistance() {
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    unordered_map<int, int> distances = bfsShortestDistance(graph, 1);
    
    assert(distances[1] == 0);
    assert(distances[2] == 1);
    assert(distances[4] == 1);
    assert(distances[3] == 2);
    
    cout << "✓ testBfsShortestDistance passed" << endl;
}

int main() {
    testBfsAdjacencyList();
    testBfsWithPath();
    testBfsLevelOrder();
    testBfsShortestDistance();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


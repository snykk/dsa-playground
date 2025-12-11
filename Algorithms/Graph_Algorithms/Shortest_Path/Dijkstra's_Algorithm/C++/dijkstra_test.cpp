/**
 * Test suite for Dijkstra's algorithm implementation
 */

#include <iostream>
#include <unordered_map>
#include <vector>
#include <cassert>
#include "dijkstra.cpp"

using namespace std;

void testDijkstraBasic() {
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 4}, {3, 2}}},
        {2, {{4, 5}}},
        {3, {{4, 1}}},
        {4, {}}
    };
    
    unordered_map<int, int> distances = dijkstra(graph, 1);
    
    assert(distances[1] == 0);
    assert(distances[2] == 4);
    assert(distances[3] == 2);
    assert(distances[4] == 3);  // 1 -> 3 -> 4 = 2 + 1 = 3
    
    cout << "✓ testDijkstraBasic passed" << endl;
}

void testDijkstraWithPath() {
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 4}, {3, 2}}},
        {2, {{4, 5}}},
        {3, {{4, 1}}},
        {4, {}}
    };
    
    auto [distance, path] = dijkstraWithPath(graph, 1, 4);
    
    assert(distance == 3);
    assert(path == vector<int>{1, 3, 4});
    
    cout << "✓ testDijkstraWithPath passed" << endl;
}

int main() {
    testDijkstraBasic();
    testDijkstraWithPath();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}



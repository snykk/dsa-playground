/**
 * Test suite for Dijkstra's algorithm implementation
 */

#include <iostream>
#include <unordered_map>
#include <vector>
#include <cassert>
#include <climits>
#include "dijkstra.cpp"

using namespace std;

void testDijkstraBasic() {
    /**Test basic Dijkstra's algorithm.*/
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
    assert(distances.size() == 4);
    
    cout << "✓ testDijkstraBasic passed" << endl;
}

void testDijkstraMultiplePaths() {
    /**Test Dijkstra's with multiple paths to same vertex.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 1}, {3, 4}}},
        {2, {{3, 2}, {4, 5}}},
        {3, {{4, 1}}},
        {4, {}}
    };
    
    unordered_map<int, int> distances = dijkstra(graph, 1);
    assert(distances[3] == 3);  // 1 -> 2 -> 3 = 1 + 2 = 3 (better than 1 -> 3 = 4)
    assert(distances[4] == 4);  // 1 -> 2 -> 3 -> 4 = 1 + 2 + 1 = 4
    
    cout << "✓ testDijkstraMultiplePaths passed" << endl;
}

void testDijkstraWithPath() {
    /**Test Dijkstra's with path reconstruction.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 4}, {3, 2}}},
        {2, {{4, 5}}},
        {3, {{4, 1}}},
        {4, {}}
    };
    
    auto [distance, path] = dijkstraWithPath(graph, 1, 4);
    
    assert(distance == 3);
    assert(path == vector<int>{1, 3, 4});
    assert(path[0] == 1);
    assert(path.back() == 4);
    
    cout << "✓ testDijkstraWithPath passed" << endl;
}

void testDijkstraWithPathSameVertex() {
    /**Test path finding from vertex to itself.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 4}, {3, 2}}},
        {2, {{4, 5}}},
        {3, {{4, 1}}},
        {4, {}}
    };
    
    auto [distance, path] = dijkstraWithPath(graph, 1, 1);
    assert(distance == 0);
    assert(path.size() == 1);
    assert(path[0] == 1);
    
    cout << "✓ testDijkstraWithPathSameVertex passed" << endl;
}

void testDijkstraNoPath() {
    /**Test Dijkstra's when no path exists.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 1}}},
        {2, {}},
        {3, {}}
    };
    
    unordered_map<int, int> distances = dijkstra(graph, 1);
    assert(distances[1] == 0);
    assert(distances[2] == 1);
    assert(distances[3] == INT_MAX);
    
    cout << "✓ testDijkstraNoPath passed" << endl;
}

void testDijkstraNoPathWithPath() {
    /**Test path finding when no path exists.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 1}}},
        {2, {}},
        {3, {}}
    };
    
    auto [distance, path] = dijkstraWithPath(graph, 1, 3);
    assert(distance == -1);
    assert(path.empty());
    
    cout << "✓ testDijkstraNoPathWithPath passed" << endl;
}

void testDijkstraSingleVertex() {
    /**Test Dijkstra's on graph with single vertex.*/
    unordered_map<int, vector<pair<int, int>>> graph = {{1, {}}};
    unordered_map<int, int> distances = dijkstra(graph, 1);
    assert(distances[1] == 0);
    assert(distances.size() == 1);
    
    cout << "✓ testDijkstraSingleVertex passed" << endl;
}

void testDijkstraEmptyGraph() {
    /**Test Dijkstra's on empty graph.*/
    unordered_map<int, vector<pair<int, int>>> graph;
    unordered_map<int, int> distances = dijkstra(graph, 1);
    assert(distances.empty());
    
    cout << "✓ testDijkstraEmptyGraph passed" << endl;
}

int main() {
    testDijkstraBasic();
    testDijkstraMultiplePaths();
    testDijkstraWithPath();
    testDijkstraWithPathSameVertex();
    testDijkstraNoPath();
    testDijkstraNoPathWithPath();
    testDijkstraSingleVertex();
    testDijkstraEmptyGraph();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}



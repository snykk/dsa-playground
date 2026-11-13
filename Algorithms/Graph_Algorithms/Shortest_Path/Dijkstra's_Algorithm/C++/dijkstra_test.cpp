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
    
    unordered_map<int, long long> distances = dijkstra(graph, 1);
    
    assert(distances[1] == 0);
    assert(distances[2] == 4);
    assert(distances[3] == 2);
    assert(distances[4] == 3);  // 1 -> 3 -> 4 = 2 + 1 = 3
    assert(distances.size() == 4);
    
    cout << "[ok] testDijkstraBasic passed" << endl;
}

void testDijkstraMultiplePaths() {
    /**Test Dijkstra's with multiple paths to same vertex.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 1}, {3, 4}}},
        {2, {{3, 2}, {4, 5}}},
        {3, {{4, 1}}},
        {4, {}}
    };
    
    unordered_map<int, long long> distances = dijkstra(graph, 1);
    assert(distances[3] == 3);  // 1 -> 2 -> 3 = 1 + 2 = 3 (better than 1 -> 3 = 4)
    assert(distances[4] == 4);  // 1 -> 2 -> 3 -> 4 = 1 + 2 + 1 = 4
    
    cout << "[ok] testDijkstraMultiplePaths passed" << endl;
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
    assert((path == vector<int>{1, 3, 4}));
    assert(path[0] == 1);
    assert(path.back() == 4);
    
    cout << "[ok] testDijkstraWithPath passed" << endl;
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
    
    cout << "[ok] testDijkstraWithPathSameVertex passed" << endl;
}

void testDijkstraNoPath() {
    /**Test Dijkstra's when no path exists.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 1}}},
        {2, {}},
        {3, {}}
    };
    
    unordered_map<int, long long> distances = dijkstra(graph, 1);
    assert(distances[1] == 0);
    assert(distances[2] == 1);
    assert(distances[3] == LLONG_MAX);  // unreachable
    
    cout << "[ok] testDijkstraNoPath passed" << endl;
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
    
    cout << "[ok] testDijkstraNoPathWithPath passed" << endl;
}

void testDijkstraSingleVertex() {
    /**Test Dijkstra's on graph with single vertex.*/
    unordered_map<int, vector<pair<int, int>>> graph = {{1, {}}};
    unordered_map<int, long long> distances = dijkstra(graph, 1);
    assert(distances[1] == 0);
    assert(distances.size() == 1);
    
    cout << "[ok] testDijkstraSingleVertex passed" << endl;
}

void testDijkstraEmptyGraph() {
    /**Test Dijkstra's on empty graph.*/
    unordered_map<int, vector<pair<int, int>>> graph;
    unordered_map<int, long long> distances = dijkstra(graph, 1);
    assert(distances.empty());
    
    cout << "[ok] testDijkstraEmptyGraph passed" << endl;
}

void testDijkstraNeighborOnlyVertex() {
    /**A vertex that appears only as a neighbor (not a map key) still gets its distance.*/
    unordered_map<int, vector<pair<int, int>>> graph = {{0, {{1, 5}}}};

    unordered_map<int, long long> distances = dijkstra(graph, 0);
    assert(distances.size() == 2);
    assert(distances[0] == 0);
    assert(distances[1] == 5);

    auto [distance, path] = dijkstraWithPath(graph, 0, 1);
    assert(distance == 5);
    assert((path == vector<int>{0, 1}));

    // Unreachable neighbor-only vertices are reported as LLONG_MAX, like key vertices.
    unordered_map<int, vector<pair<int, int>>> split = {{0, {}}, {2, {{3, 1}}}};
    unordered_map<int, long long> splitDistances = dijkstra(split, 0);
    assert(splitDistances.size() == 3);
    assert(splitDistances[3] == LLONG_MAX);

    cout << "[ok] testDijkstraNeighborOnlyVertex passed" << endl;
}

void testDijkstraWithPathStartNotInGraph() {
    /**start == target outside the graph returns (0, [start]) instead of looping forever.*/
    unordered_map<int, vector<pair<int, int>>> empty;
    auto [distance, path] = dijkstraWithPath(empty, 5, 5);
    assert(distance == 0);
    assert((path == vector<int>{5}));

    unordered_map<int, vector<pair<int, int>>> graph = {{0, {}}};
    auto [distance2, path2] = dijkstraWithPath(graph, 5, 5);
    assert(distance2 == 0);
    assert((path2 == vector<int>{5}));

    auto [distance3, path3] = dijkstraWithPath(graph, 5, 0);
    assert(distance3 == -1);
    assert(path3.empty());

    cout << "[ok] testDijkstraWithPathStartNotInGraph passed" << endl;
}

void testDijkstraLargeWeightsNoOverflow() {
    /**Distances above INT_MAX are exact (long long), not wrapped to negative values.*/
    unordered_map<int, vector<pair<int, int>>> graph = {
        {0, {{1, 2000000000}}},
        {1, {{2, 2000000000}}},
        {2, {}}
    };

    unordered_map<int, long long> distances = dijkstra(graph, 0);
    assert(distances[2] == 4000000000LL);

    auto [distance, path] = dijkstraWithPath(graph, 0, 2);
    assert(distance == 4000000000LL);
    assert((path == vector<int>{0, 1, 2}));

    cout << "[ok] testDijkstraLargeWeightsNoOverflow passed" << endl;
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
    testDijkstraNeighborOnlyVertex();
    testDijkstraWithPathStartNotInGraph();
    testDijkstraLargeWeightsNoOverflow();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}



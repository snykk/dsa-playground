/**
 * Test suite for BFS implementation
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <cassert>
#include <algorithm>
#include <chrono>
#include "bfs.cpp"

using namespace std;

void testBfsAdjacencyList() {
    /**Test basic BFS traversal on simple graph.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    vector<int> result = bfsAdjacencyList(graph, 1);
    vector<int> expected = {1, 2, 4, 3};
    
    assert(result == expected);
    assert(result.size() == 4);
    assert(result[0] == 1);
    assert(result.back() == 3);
    cout << "[PASS] testBfsAdjacencyList passed" << endl;
}

void testBfsAdjacencyListUndirected() {
    /**Test BFS on undirected graph.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2, 5}},
        {2, {1, 3}},
        {3, {2, 4}},
        {4, {3}},
        {5, {1}}
    };
    
    vector<int> result = bfsAdjacencyList(graph, 1);
    assert(result.size() == 5);
    assert(result[0] == 1);
    assert(find(result.begin(), result.end(), 2) != result.end());
    assert(find(result.begin(), result.end(), 3) != result.end());
    assert(find(result.begin(), result.end(), 4) != result.end());
    assert(find(result.begin(), result.end(), 5) != result.end());
    cout << "[PASS] testBfsAdjacencyListUndirected passed" << endl;
}

void testBfsWithPath() {
    /**Test finding path when path exists.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    vector<int> path = bfsWithPath(graph, 1, 3);
    vector<int> expected = {1, 2, 3};
    
    assert(path == expected);
    assert(path[0] == 1);
    assert(path.back() == 3);
    cout << "[PASS] testBfsWithPath passed" << endl;
}

void testBfsWithPathNotFound() {
    /**Test finding path when no path exists.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2}},
        {2, {1}},
        {3, {4}},
        {4, {3}}
    };
    
    vector<int> path = bfsWithPath(graph, 1, 3);
    assert(path.empty());
    cout << "[PASS] testBfsWithPathNotFound passed" << endl;
}

void testBfsWithPathSameVertex() {
    /**Test finding path from vertex to itself.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    vector<int> path = bfsWithPath(graph, 1, 1);
    assert(path.size() == 1);
    assert(path[0] == 1);
    cout << "[PASS] testBfsWithPathSameVertex passed" << endl;
}

void testBfsLevelOrder() {
    /**Test BFS level-order traversal.*/
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
    
    cout << "[PASS] testBfsLevelOrder passed" << endl;
}

void testBfsShortestDistance() {
    /**Test finding shortest distances.*/
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
    assert(distances.size() == 4);
    
    cout << "[PASS] testBfsShortestDistance passed" << endl;
}

void testBfsEmptyGraph() {
    /**Test BFS on empty graph.*/
    unordered_map<int, vector<int>> graph;
    vector<int> result = bfsAdjacencyList(graph, 1);
    assert(result.empty());
    cout << "[PASS] testBfsEmptyGraph passed" << endl;
}

void testBfsSingleVertex() {
    /**Test BFS on graph with single vertex.*/
    unordered_map<int, vector<int>> graph = {{1, {}}};
    vector<int> result = bfsAdjacencyList(graph, 1);
    assert(result.size() == 1);
    assert(result[0] == 1);
    cout << "[PASS] testBfsSingleVertex passed" << endl;
}

void testBfsStartNotInGraph() {
    /**Test BFS when start vertex not in graph.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {}}
    };
    vector<int> result = bfsAdjacencyList(graph, 99);
    assert(result.empty());
    cout << "[PASS] testBfsStartNotInGraph passed" << endl;
}

void testBfsWithPathNeighborOnlyTarget() {
    /**A target that only appears in neighbor lists (no key) is still reachable.*/
    unordered_map<int, vector<int>> graph = {{0, {1}}};
    assert((bfsWithPath(graph, 0, 1) == vector<int>{0, 1}));

    unordered_map<int, vector<int>> chain = {{0, {1}}, {1, {2}}};
    assert((bfsWithPath(chain, 0, 2) == vector<int>{0, 1, 2}));
    assert(bfsWithPath(chain, 0, 3).empty());
    cout << "[PASS] testBfsWithPathNeighborOnlyTarget passed" << endl;
}

void testBfsWithPathLongPath() {
    /**Path rebuilt from parents on a 200000-vertex chain (no path copy per enqueue).*/
    const int n = 200000;
    unordered_map<int, vector<int>> graph;
    for (int i = 0; i + 1 < n; ++i) {
        graph[i] = {i + 1};
    }
    graph[n - 1] = {};

    auto started = chrono::steady_clock::now();
    vector<int> path = bfsWithPath(graph, 0, n - 1);
    double seconds = chrono::duration<double>(chrono::steady_clock::now() - started).count();
    assert(static_cast<int>(path.size()) == n);
    for (int i = 0; i < n; ++i) {
        assert(path[i] == i);
    }
    // The old path-copying version (O(V^2)) needed over 10 seconds here.
    assert(seconds < 2.0);
    cout << "[PASS] testBfsWithPathLongPath passed" << endl;
}

int main() {
    testBfsAdjacencyList();
    testBfsAdjacencyListUndirected();
    testBfsWithPath();
    testBfsWithPathNotFound();
    testBfsWithPathSameVertex();
    testBfsLevelOrder();
    testBfsShortestDistance();
    testBfsEmptyGraph();
    testBfsSingleVertex();
    testBfsStartNotInGraph();
    testBfsWithPathNeighborOnlyTarget();
    testBfsWithPathLongPath();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


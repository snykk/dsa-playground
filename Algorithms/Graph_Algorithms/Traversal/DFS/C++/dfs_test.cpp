/**
 * Test suite for DFS implementation
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <cassert>
#include <algorithm>
#include <chrono>
#include "dfs.cpp"

using namespace std;

void testDfsAdjacencyList() {
    /**Test basic DFS traversal on simple graph.*/
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
    
    cout << "[PASS] testDfsAdjacencyList passed" << endl;
}

void testDfsAdjacencyListUndirected() {
    /**Test DFS on undirected graph.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2, 5}},
        {2, {1, 3}},
        {3, {2, 4}},
        {4, {3}},
        {5, {1}}
    };
    
    vector<int> result = dfsAdjacencyList(graph, 1);
    assert(result.size() == 5);
    assert(result[0] == 1);
    assert(find(result.begin(), result.end(), 2) != result.end());
    assert(find(result.begin(), result.end(), 3) != result.end());
    assert(find(result.begin(), result.end(), 4) != result.end());
    assert(find(result.begin(), result.end(), 5) != result.end());
    
    cout << "[PASS] testDfsAdjacencyListUndirected passed" << endl;
}

void testDfsWithPath() {
    /**Test finding path when path exists.*/
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
    assert(find(path.begin(), path.end(), 2) != path.end());
    
    cout << "[PASS] testDfsWithPath passed" << endl;
}

void testDfsWithPathNotFound() {
    /**Test finding path when no path exists.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2}},
        {2, {1}},
        {3, {4}},
        {4, {3}}
    };
    
    vector<int> path = dfsWithPath(graph, 1, 3);
    assert(path.empty());
    
    cout << "[PASS] testDfsWithPathNotFound passed" << endl;
}

void testDfsWithPathSameVertex() {
    /**Test finding path from vertex to itself.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    vector<int> path = dfsWithPath(graph, 1, 1);
    assert(path.size() == 1);
    assert(path[0] == 1);
    
    cout << "[PASS] testDfsWithPathSameVertex passed" << endl;
}

void testDfsDetectCycle() {
    /**Test cycle detection in directed graph.*/
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
    
    cout << "[PASS] testDfsDetectCycle passed" << endl;
}

void testDfsDetectCycleUndirected() {
    /**Test cycle detection in undirected graph.*/
    // Triangle: 1-2, 2-3, 3-1 (has cycle)
    unordered_map<int, vector<int>> cyclicGraph = {
        {1, {2, 3}},
        {2, {1, 3}},
        {3, {2, 1}}
    };

    bool hasCycle = dfsDetectCycle(cyclicGraph, false);
    assert(hasCycle);

    // Simple path: 1-2-3 (no cycle)
    unordered_map<int, vector<int>> acyclicGraph = {
        {1, {2}},
        {2, {1, 3}},
        {3, {2}}
    };

    hasCycle = dfsDetectCycle(acyclicGraph, false);
    assert(!hasCycle);
    
    cout << "[PASS] testDfsDetectCycleUndirected passed" << endl;
}

void testDfsEmptyGraph() {
    /**Test DFS on empty graph.*/
    unordered_map<int, vector<int>> graph;
    vector<int> result = dfsAdjacencyList(graph, 1);
    assert(result.empty());
    
    cout << "[PASS] testDfsEmptyGraph passed" << endl;
}

void testDfsSingleVertex() {
    /**Test DFS on graph with single vertex.*/
    unordered_map<int, vector<int>> graph = {{1, {}}};
    vector<int> result = dfsAdjacencyList(graph, 1);
    assert(result.size() == 1);
    assert(result[0] == 1);
    
    cout << "[PASS] testDfsSingleVertex passed" << endl;
}

void testDfsStartNotInGraph() {
    /**Test DFS when start vertex not in graph.*/
    unordered_map<int, vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {}}
    };
    vector<int> result = dfsAdjacencyList(graph, 99);
    assert(result.empty());
    
    cout << "[PASS] testDfsStartNotInGraph passed" << endl;
}

void testDfsWithPathNeighborOnlyTarget() {
    /**A target that only appears in neighbor lists (no key) is still reachable.*/
    unordered_map<int, vector<int>> graph = {{0, {1}}};
    assert((dfsWithPath(graph, 0, 1) == vector<int>{0, 1}));

    unordered_map<int, vector<int>> branching = {{0, {1, 2}}, {1, {3}}};
    assert((dfsWithPath(branching, 0, 3) == vector<int>{0, 1, 3}));
    assert(dfsWithPath(graph, 0, 2).empty());

    cout << "[PASS] testDfsWithPathNeighborOnlyTarget passed" << endl;
}

void testDfsWithPathFollowsDfsOrder() {
    /**The path is the one DFS walked: 4 is first pushed from 1 but reached via 2.*/
    unordered_map<int, vector<int>> graph = {{1, {2, 4}}, {2, {4}}, {4, {}}};
    assert((dfsWithPath(graph, 1, 4) == vector<int>{1, 2, 4}));

    unordered_map<int, vector<int>> longer = {{1, {2, 4}}, {2, {3}}, {3, {4}}, {4, {}}};
    assert((dfsWithPath(longer, 1, 4) == vector<int>{1, 2, 3, 4}));

    cout << "[PASS] testDfsWithPathFollowsDfsOrder passed" << endl;
}

void testDfsWithPathLongPath() {
    /**Path rebuilt from parents on a 200000-vertex chain (no path copy per push).*/
    const int n = 200000;
    unordered_map<int, vector<int>> chain;
    for (int i = 0; i + 1 < n; ++i) {
        chain[i] = {i + 1};
    }
    chain[n - 1] = {};

    auto started = chrono::steady_clock::now();
    vector<int> path = dfsWithPath(chain, 0, n - 1);
    double seconds = chrono::duration<double>(chrono::steady_clock::now() - started).count();
    assert(static_cast<int>(path.size()) == n);
    for (int i = 0; i < n; ++i) {
        assert(path[i] == i);
    }
    // The old path-copying version (O(V^2)) needed several seconds here.
    assert(seconds < 2.0);

    cout << "[PASS] testDfsWithPathLongPath passed" << endl;
}

void testDfsDetectCycleNegativeVertex() {
    /**-1 is an ordinary vertex: it must not be mistaken for "no parent".*/
    unordered_map<int, vector<int>> selfLoop = {{-1, {-1}}};
    assert(dfsDetectCycle(selfLoop, false));

    // A single edge -1 - 0 is not a cycle, whichever end the search starts from
    unordered_map<int, vector<int>> edge = {{-1, {0}}, {0, {-1}}};
    assert(!dfsDetectCycle(edge, false));

    unordered_map<int, vector<int>> triangle = {{-1, {0, 1}}, {0, {-1, 1}}, {1, {0, -1}}};
    assert(dfsDetectCycle(triangle, false));

    cout << "[PASS] testDfsDetectCycleNegativeVertex passed" << endl;
}

void testDfsDetectCycleDeepPath() {
    /**A 1000000-vertex path used to overflow the call stack (recursive lambda).*/
    const int n = 1000000;
    unordered_map<int, vector<int>> undirected;
    undirected.reserve(n);
    for (int i = 0; i < n; ++i) {
        vector<int> neighbors;
        if (i > 0) neighbors.push_back(i - 1);
        if (i + 1 < n) neighbors.push_back(i + 1);
        undirected[i] = neighbors;
    }
    assert(!dfsDetectCycle(undirected, false));
    undirected[0].push_back(n - 1);
    undirected[n - 1].push_back(0);
    assert(dfsDetectCycle(undirected, false));

    unordered_map<int, vector<int>> directed;
    directed.reserve(n);
    for (int i = 0; i + 1 < n; ++i) {
        directed[i] = {i + 1};
    }
    directed[n - 1] = {};
    assert(!dfsDetectCycle(directed, true));
    directed[n - 1] = {0};
    assert(dfsDetectCycle(directed, true));

    cout << "[PASS] testDfsDetectCycleDeepPath passed" << endl;
}

int main() {
    testDfsAdjacencyList();
    testDfsAdjacencyListUndirected();
    testDfsWithPath();
    testDfsWithPathNotFound();
    testDfsWithPathSameVertex();
    testDfsDetectCycle();
    testDfsDetectCycleUndirected();
    testDfsEmptyGraph();
    testDfsSingleVertex();
    testDfsStartNotInGraph();
    testDfsWithPathNeighborOnlyTarget();
    testDfsWithPathFollowsDfsOrder();
    testDfsWithPathLongPath();
    testDfsDetectCycleNegativeVertex();
    testDfsDetectCycleDeepPath();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


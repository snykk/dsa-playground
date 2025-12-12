/**
 * Test suite for DFS implementation
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <cassert>
#include <algorithm>
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
    
    cout << "✓ testDfsAdjacencyList passed" << endl;
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
    
    cout << "✓ testDfsAdjacencyListUndirected passed" << endl;
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
    
    cout << "✓ testDfsWithPath passed" << endl;
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
    
    cout << "✓ testDfsWithPathNotFound passed" << endl;
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
    
    cout << "✓ testDfsWithPathSameVertex passed" << endl;
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
    
    cout << "✓ testDfsDetectCycle passed" << endl;
}

void testDfsDetectCycleUndirected() {
    /**Test cycle detection in undirected graph.*/
    unordered_map<int, vector<int>> cyclicGraph = {
        {1, {2}},
        {2, {1, 3}},
        {3, {2}}
    };
    
    bool hasCycle = dfsDetectCycle(cyclicGraph, false);
    assert(hasCycle);
    
    unordered_map<int, vector<int>> acyclicGraph = {
        {1, {2}},
        {2, {1}},
        {3, {}}
    };
    
    hasCycle = dfsDetectCycle(acyclicGraph, false);
    assert(!hasCycle);
    
    cout << "✓ testDfsDetectCycleUndirected passed" << endl;
}

void testDfsEmptyGraph() {
    /**Test DFS on empty graph.*/
    unordered_map<int, vector<int>> graph;
    vector<int> result = dfsAdjacencyList(graph, 1);
    assert(result.empty());
    
    cout << "✓ testDfsEmptyGraph passed" << endl;
}

void testDfsSingleVertex() {
    /**Test DFS on graph with single vertex.*/
    unordered_map<int, vector<int>> graph = {{1, {}}};
    vector<int> result = dfsAdjacencyList(graph, 1);
    assert(result.size() == 1);
    assert(result[0] == 1);
    
    cout << "✓ testDfsSingleVertex passed" << endl;
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
    
    cout << "✓ testDfsStartNotInGraph passed" << endl;
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
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


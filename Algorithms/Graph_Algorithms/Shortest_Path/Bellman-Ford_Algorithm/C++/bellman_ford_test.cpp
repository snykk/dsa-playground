/**
 * Test suite for Bellman-Ford algorithm implementation
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <cassert>
#include <climits>
#include "bellman_ford.cpp"

using namespace std;

void testBellmanFordBasic() {
    /**Test basic Bellman-Ford algorithm.*/
    vector<Edge> edges = {
        {0, 1, 4},
        {0, 2, 2},
        {1, 3, 5},
        {2, 3, 1}
    };
    
    unordered_map<int, int> distances = bellmanFord(edges, 4, 0);
    
    assert(!distances.empty());
    assert(distances[0] == 0);
    assert(distances[1] == 4);
    assert(distances[2] == 2);
    assert(distances[3] == 3);
    assert(distances.size() == 4);
    
    cout << "✓ testBellmanFordBasic passed" << endl;
}

void testBellmanFordNegativeEdge() {
    /**Test Bellman-Ford with negative edge weights.*/
    vector<Edge> edges = {
        {0, 1, 4},
        {0, 2, 2},
        {1, 3, -5},
        {2, 3, 1}
    };
    
    unordered_map<int, int> distances = bellmanFord(edges, 4, 0);
    
    assert(!distances.empty());
    assert(distances[0] == 0);
    assert(distances[1] == 4);
    assert(distances[2] == 2);
    assert(distances[3] == -1);  // 0 -> 1 -> 3 = 4 + (-5) = -1
    
    cout << "✓ testBellmanFordNegativeEdge passed" << endl;
}

void testBellmanFordNegativeCycle() {
    /**Test Bellman-Ford detects negative cycle.*/
    vector<Edge> edges = {
        {0, 1, 1},
        {1, 2, -2},
        {2, 0, -1}
    };
    
    unordered_map<int, int> distances = bellmanFord(edges, 3, 0);
    
    assert(distances.empty());  // Negative cycle detected
    
    cout << "✓ testBellmanFordNegativeCycle passed" << endl;
}

void testBellmanFordMultipleNegativeEdges() {
    /**Test Bellman-Ford with multiple negative edges (no cycle).*/
    vector<Edge> edges = {
        {0, 1, 3},
        {1, 2, -2},
        {2, 3, -1},
        {0, 3, 5}
    };
    
    unordered_map<int, int> distances = bellmanFord(edges, 4, 0);
    
    assert(!distances.empty());
    assert(distances[0] == 0);
    assert(distances[3] == 0);  // 0 -> 1 -> 2 -> 3 = 3 + (-2) + (-1) = 0
    
    cout << "✓ testBellmanFordMultipleNegativeEdges passed" << endl;
}

void testBellmanFordSingleVertex() {
    /**Test Bellman-Ford on graph with single vertex.*/
    vector<Edge> edges;
    unordered_map<int, int> distances = bellmanFord(edges, 1, 0);
    
    assert(!distances.empty());
    assert(distances[0] == 0);
    assert(distances.size() == 1);
    
    cout << "✓ testBellmanFordSingleVertex passed" << endl;
}

void testBellmanFordEmptyGraph() {
    /**Test Bellman-Ford on empty graph.*/
    vector<Edge> edges;
    unordered_map<int, int> distances = bellmanFord(edges, 0, 0);
    
    assert(distances.empty());
    
    cout << "✓ testBellmanFordEmptyGraph passed" << endl;
}

void testBellmanFordNoPath() {
    /**Test Bellman-Ford when no path exists.*/
    vector<Edge> edges = {
        {0, 1, 1},
        {2, 3, 1}
    };
    
    unordered_map<int, int> distances = bellmanFord(edges, 4, 0);
    
    assert(!distances.empty());
    assert(distances[0] == 0);
    assert(distances[1] == 1);
    assert(distances[2] == INT_MAX);
    assert(distances[3] == INT_MAX);
    
    cout << "✓ testBellmanFordNoPath passed" << endl;
}

int main() {
    testBellmanFordBasic();
    testBellmanFordNegativeEdge();
    testBellmanFordNegativeCycle();
    testBellmanFordMultipleNegativeEdges();
    testBellmanFordSingleVertex();
    testBellmanFordEmptyGraph();
    testBellmanFordNoPath();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}



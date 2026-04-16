/**
 * Test suite for Floyd-Warshall algorithm implementation
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <climits>
#include "floyd_warshall.cpp"

using namespace std;

void testFloydWarshallBasic() {
    /**Test basic Floyd-Warshall algorithm.*/
    vector<vector<pair<int, int>>> graph = {
        {{1, 4}, {2, 2}},
        {{3, 5}},
        {{3, 1}},
        {}
    };
    
    vector<vector<int>> dist = floydWarshall(graph, 4);
    
    assert(dist[0][0] == 0);
    assert(dist[1][1] == 0);
    assert(dist[2][2] == 0);
    assert(dist[3][3] == 0);
    assert(dist[0][1] == 4);
    assert(dist[0][2] == 2);
    assert(dist[0][3] == 3);  // 0 -> 2 -> 3 = 2 + 1 = 3
    assert(dist[1][3] == 5);
    assert(dist[2][3] == 1);
    
    cout << "✓ testFloydWarshallBasic passed" << endl;
}

void testFloydWarshallAllPairs() {
    /**Test Floyd-Warshall finds all pairs shortest paths.*/
    vector<vector<pair<int, int>>> graph = {
        {{1, 4}, {2, 2}},
        {{3, 5}},
        {{3, 1}},
        {}
    };
    
    vector<vector<int>> dist = floydWarshall(graph, 4);
    
    // Test all pairs
    for (int i = 0; i < 4; ++i) {
        assert(dist[i][i] == 0);
    }
    
    // Test specific paths
    assert(dist[1][0] == INT_MAX);  // No path from 1 to 0
    assert(dist[2][0] == INT_MAX);  // No path from 2 to 0
    assert(dist[3][0] == INT_MAX);  // No path from 3 to 0
    
    cout << "✓ testFloydWarshallAllPairs passed" << endl;
}

void testFloydWarshallCompleteGraph() {
    /**Test Floyd-Warshall on complete graph.*/
    vector<vector<pair<int, int>>> graph = {
        {{1, 1}, {2, 3}},
        {{0, 1}, {2, 1}},
        {{0, 3}, {1, 1}}
    };
    
    vector<vector<int>> dist = floydWarshall(graph, 3);
    
    assert(dist[0][1] == 1);
    assert(dist[0][2] == 2);  // 0 -> 1 -> 2 = 1 + 1 = 2
    assert(dist[1][2] == 1);
    
    cout << "✓ testFloydWarshallCompleteGraph passed" << endl;
}

void testFloydWarshallSingleVertex() {
    /**Test Floyd-Warshall on graph with single vertex.*/
    vector<vector<pair<int, int>>> graph = {{}};
    vector<vector<int>> dist = floydWarshall(graph, 1);
    
    assert(dist[0][0] == 0);
    assert(dist.size() == 1);
    
    cout << "✓ testFloydWarshallSingleVertex passed" << endl;
}

void testFloydWarshallEmptyGraph() {
    /**Test Floyd-Warshall on empty graph.*/
    vector<vector<pair<int, int>>> graph;
    vector<vector<int>> dist = floydWarshall(graph, 0);
    
    assert(dist.empty());
    
    cout << "✓ testFloydWarshallEmptyGraph passed" << endl;
}

int main() {
    testFloydWarshallBasic();
    testFloydWarshallAllPairs();
    testFloydWarshallCompleteGraph();
    testFloydWarshallSingleVertex();
    testFloydWarshallEmptyGraph();
    
    cout << "\nAll tests passed!" << endl;
    return 0;
}


